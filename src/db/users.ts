import { db } from './index.ts';
import { users, userProfiles } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoUrl?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      if (displayName || photoUrl) {
        await db.update(users).set({
          displayName: displayName || existing[0].displayName,
          photoUrl: photoUrl || existing[0].photoUrl,
        }).where(eq(users.id, existing[0].id));
      }
      return existing[0];
    }

    const inserted = await db.insert(users).values({
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      photoUrl: photoUrl || '',
    }).returning();

    const newUser = inserted[0];

    // Initialize user profile
    await db.insert(userProfiles).values({
      userId: newUser.id,
      bio: 'AetherVoice explorer & galaxy navigator',
      vocalPreference: 'natural',
      preferredLanguage: 'English',
    });

    return newUser;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user in Cloud SQL', { cause: error });
  }
}

export async function getUserProfileData(uid: string) {
  try {
    const userList = await db.select().from(users).where(eq(users.uid, uid));
    if (userList.length === 0) return null;

    const userObj = userList[0];
    const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, userObj.id));

    return {
      user: userObj,
      profile: profiles[0] || null,
    };
  } catch (error) {
    console.error('Error in getUserProfileData:', error);
    throw new Error('Failed to retrieve user profile from Cloud SQL', { cause: error });
  }
}

export async function updateUserProfileData(uid: string, data: { bio?: string; spaceTheme?: string; vocalPreference?: string; preferredLanguage?: string }) {
  try {
    const userList = await db.select().from(users).where(eq(users.uid, uid));
    if (userList.length === 0) throw new Error('User not found');

    const userObj = userList[0];
    if (data.spaceTheme) {
      await db.update(users).set({ spaceTheme: data.spaceTheme }).where(eq(users.id, userObj.id));
    }

    const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, userObj.id));
    if (profiles.length > 0) {
      await db.update(userProfiles).set({
        bio: data.bio !== undefined ? data.bio : profiles[0].bio,
        vocalPreference: data.vocalPreference || profiles[0].vocalPreference,
        preferredLanguage: data.preferredLanguage || profiles[0].preferredLanguage,
        updatedAt: new Date(),
      }).where(eq(userProfiles.id, profiles[0].id));
    } else {
      await db.insert(userProfiles).values({
        userId: userObj.id,
        bio: data.bio || '',
        vocalPreference: data.vocalPreference || 'natural',
        preferredLanguage: data.preferredLanguage || 'English',
      });
    }

    return await getUserProfileData(uid);
  } catch (error) {
    console.error('Error in updateUserProfileData:', error);
    throw new Error('Failed to update user profile in Cloud SQL', { cause: error });
  }
}
