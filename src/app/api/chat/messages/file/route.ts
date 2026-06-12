import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { b2 } from "@/lib/b2/b2";
import { STATUS_CODE } from "@/constants/enums";
import { B2_BUCKET_NAME, B2_REGION } from "@/constants/b2_folder";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/app/auth/actions";
import { ChatMessageStatusEnum, ChatMessageTypeEnum } from "@/interfaces/chat";

const folder = "HNB_TALK";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    const form = await req.formData();
    const files = form.getAll("files") as File[];
    const id = form.get("id") as string;
    const content = form.get("content") as string;

    if (!files || !files.length) {
      return NextResponse.json(
        { error: "Không tìm thấy file!" },
        { status: STATUS_CODE.BAD_REQUEST }
      );
    }

    const urlList = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${folder}/${Date.now()}-${file.name}`;

        await b2.send(
          new PutObjectCommand({
            Bucket: B2_BUCKET_NAME,
            Key: filename,
            Body: buffer,
            ContentType: file.type,
          })
        );

        return `https://${B2_BUCKET_NAME}.s3.${B2_REGION}.backblazeb2.com/${filename}`;
      })
    );

    const attachment_url = urlList.length > 0 ? urlList.join("|") : undefined;

    const newMessage = {
      id,
      content,
      attachment_url,
      sender: userId,
      type: ChatMessageTypeEnum.IMAGE,
      status: ChatMessageStatusEnum.SENT,
    };

    const { data, error } = await supabase
      .from("chat_messages")
      .insert(newMessage)
      .select(
        "*, thread:chat_messages_thread_fkey(*), sender:chat_messages_sender_fkey(id, display_name, avatar)"
      )
      .maybeSingle();

    if (error) {
      console.log({ error });
      return NextResponse.json({ data: null, status: STATUS_CODE.BAD_REQUEST });
    }

    return NextResponse.json(
      {
        data,
        status: STATUS_CODE.CREATED,
      },
      { status: STATUS_CODE.CREATED }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || `Upload failed to ${folder}` },
      { status: STATUS_CODE.INTERNAL_SERVER_ERROR }
    );
  }
}
