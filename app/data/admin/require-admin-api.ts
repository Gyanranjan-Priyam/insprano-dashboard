import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";

export const requireAdminAPI = cache(async () => {
     const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(!session) {
        return null;
    }

    if(session.user.role !== 'admin') {
        return null;
    }

    return session;
})