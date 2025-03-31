'use server';

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const FIVE_DAYS = 60 * 60 * 24 * 5;
export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;

    try {
        const userRecord = await db.collection('users').doc(uid).get();
        if (userRecord.exists) {
            return {
                success: false,
                error: 'User already exists'
            }
        }

        await db.collection('users').doc(uid).set({
            name, email
        })
        return {
            success: true,
            message: 'User created successfully, please sign in'
        }

    } catch (error: any) {
        console.error('Error creating user:', error);

        if (error.code === 'auth/email-already-exists') {
            return {
                success: false,
                error: 'Email already exists'
            }
        }
        return {
            success: false,
            error: 'Something went wrong'
        }
    }
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;
    try {
        const userRecord = await auth.getUserByEmail(email);
        if (!userRecord) {
            return {
                success: false,
                error: 'User does not exist'
            }
        }
        await setSessionCookie(idToken);
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: 'Something went wrong, failed to log into account'
        }
    }

}

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: FIVE_DAYS * 1000, // 5 days
    })
    cookieStore.set('session', sessionCookie, {
        maxAge: FIVE_DAYS,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    })
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return null;

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();
        if (!userRecord.exists) return null;
        return{
            ...userRecord.data(),
            id: decodedClaims.id,
        } as User
    } catch (error) {
        console.log(error);
        return null;
    }

}

export async function isAuthenticated(){
    const user = await getCurrentUser();
    return !!user
}