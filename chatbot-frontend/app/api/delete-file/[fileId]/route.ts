/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/delete-file/[fileId]/route.ts

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    fileId: string;
  }>;
};

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { fileId } = await params;

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY!;

    const auth = Buffer.from(`${privateKey}:`).toString("base64");

    const { data } = await axios.delete(
      `https://api.imagekit.io/v1/files/${fileId}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    );

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.response?.data || error.message,
      },
      { status: 500 },
    );
  }
}
