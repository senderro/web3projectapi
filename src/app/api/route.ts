// src/pages/api/hello.ts
import { NextResponse } from 'next/server';

export async function GET(){
  return NextResponse.json({
    hello: "world"
  });
} 