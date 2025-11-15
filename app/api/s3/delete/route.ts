import { requireAdminAPI } from "@/app/data/admin/require-admin-api";
import arcjet, {  fixedWindow } from "@/lib/arcjet";
import { env } from "@/lib/env";
import { S3 } from "@/lib/s3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

        const aj = arcjet
            .withRule(
                fixedWindow({
                    mode: 'LIVE',
                    window: '1m',
                    max: 5,
                })
            );

export async function DELETE(request: Request) {

    const session = await requireAdminAPI();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    try {
        const body = await request.json();

        const key = body.key;

        const decision = await aj.protect(request, {
            fingerprint: session?.user.id as string,
        });
        
        if (decision.isDenied()) {
            return NextResponse.json({error: "Too many requests"}, {status: 420});
        }

        if(!key) {
            return NextResponse.json(
                {error: "Missing 'key' in request body"},
                {status: 400}
            );
        }

        const command = new DeleteObjectCommand({
            Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
            Key: key,
        });

        await S3.send(command);

        return NextResponse.json(
            {message: "File deleted successfully"},
            {status: 200}
        )
    } catch {
        return NextResponse.json(
            {error: "Failed to delete file"},
            {status: 500}
        )
    }
}