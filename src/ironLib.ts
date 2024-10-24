import { SessionOptions } from "iron-session";

export interface SessionData {
  address?: string;
  isLoggedIn:boolean;
}

export const defaultSession:SessionData = {
  isLoggedIn:false
}

export const sessionOptions: SessionOptions ={
  password: process.env.SESSION_SECRET!,
  cookieName: "web3apiNftMarket-session",
  cookieOptions:{
    httpOnly:true,
    secure: process.env.NODE_ENV === "production"
  }
}