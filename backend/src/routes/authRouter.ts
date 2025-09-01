import { Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { google } from "googleapis";
import { env } from "../config/env";
import { prisma } from "../db/prisma";
import { generateToken } from "../utils";
import { TokenType } from "../types";

export const authRouter = Router();

const GOOGLE_REDIRECT_URI =
  env.NODE_ENV === "production"
    ? env.GOOGLE_REDIRECT_URI_PROD
    : env.GOOGLE_REDIRECT_URI_DEV;
const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

authRouter.post("/google", async (req, res) => {
  try {
    console.log("OAuth callback received");
    const { code } = req.body;
    console.log("Authorization code:", code);

    // Exchange code for tokens (temporary use only)
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: GOOGLE_REDIRECT_URI,
    });
    console.log("Received tokens:", tokens);

    // Use tokens to get user info, then discard them
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    console.log("Google user info:", userInfo);

    // Verify the token is legitimate by checking issuer, audience, etc.
    if (!tokens.id_token) {
      throw new Error("No id_token returned from Google");
    }
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    console.log("ID token verified", ticket);

    const payload = ticket.getPayload();
    console.log("Verified Google ID token payload:", payload);
    if (!payload || !payload.email || payload.email_verified !== true) {
      throw new Error("Unverified Google email.");
    }
    if (userInfo.email && userInfo.email !== payload.email) {
      throw new Error("Mismatch between ID token email and userinfo email.");
    }

    // Find or create user (NO Google tokens stored)
    if (!userInfo.email || !userInfo.name || !userInfo.picture) {
      throw new Error("Google account did not return required details");
    }
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          profilePic: userInfo.picture,
          isOnboarded: false,
        },
      });
    }

    // Create YOUR OWN tokens

    const accessToken = generateToken(
      user.id,
      TokenType.ACCESS,
      env.JWT_ACCESS_SECRET
    );

    const refreshToken = generateToken(
      user.id,
      TokenType.REFRESH,
      env.JWT_REFRESH_SECRET
    );

    // Store only YOUR refresh token
    user = await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });
    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken,

      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(400).json({ error: "Authentication failed" });
  }
});

authRouter.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    let payload: string | JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
      if (typeof payload === "string") {
        throw new Error("Invalid token payload");
      }
      if (payload.type !== TokenType.REFRESH) {
        throw new Error("Invalid token type");
      }
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const newAccessToken = generateToken(
      user.id,
      TokenType.ACCESS,
      env.JWT_ACCESS_SECRET
    );
    const newRefreshToken = generateToken(
      user.id,
      TokenType.REFRESH,
      env.JWT_REFRESH_SECRET
    );

    // Update refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    // Set new refresh token in HTTP-only cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Could not refresh token" });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      let payload: string | JwtPayload;
      try {
        payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
        if (typeof payload === "string") {
          throw new Error("Invalid token payload");
        }
        if (payload.type !== TokenType.REFRESH) {
          throw new Error("Invalid token type");
        }
      } catch (err) {
        // Even if token is invalid, we still clear the cookie
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "lax",
        });
        return res.status(200).json({ message: "Logged out" });
      }

      // Invalidate refresh token in DB
      await prisma.user.updateMany({
        where: { id: payload.userId, refreshToken: token },
        data: { refreshToken: "" },
      });
    }

    // Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Could not log out" });
  }
});

authRouter.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    let payload: string | JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
      if (typeof payload === "string") {
        throw new Error("Invalid token payload");
      }
      if (payload.type !== TokenType.ACCESS) {
        throw new Error("Invalid token type");
      }
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePic: user.profilePic,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Could not fetch user" });
  }
});
