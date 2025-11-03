import { connectDB } from "../config/db.config.js";
import { Inngest } from 'inngest';
import User from '../models/user.model.js';

export const inngest = new Inngest({ id: 'code-mate' });

const syncUser = inngest.createFunction(
    { id: "sync-user" },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        await connectDB();
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
        const newUser = {
            clerkId: id,
            email: email_addresses[0].email_address,
            name: `${first_name || ""} ${last_name || ""}`.trim(),
            profileImage: image_url
        }
        await User.create(newUser);

        // Todo create user on Stream
    }
);

const deleteUser = inngest.createFunction(
    { id: 'delete-user' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        await connectDB();
        const { id } = event.data;
        await User.findOneAndDelete({ clerkId: id });

        // Todo delete user on Stream
    }
);

export const functions = [syncUser, deleteUser];