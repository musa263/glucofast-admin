import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../lib/firebase-admin';
import { verifyAdmin } from '../../../lib/auth';

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const usersSnap = await adminDb.collection('users').limit(100).get();
  const users = usersSnap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
  return NextResponse.json({ users });
}

// PATCH: update a user (toggle premium, set role, etc.)
export async function PATCH(req) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { uid, isPremium, premiumExpiry, role } = await req.json();
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });

  const updates = {};
  if (typeof isPremium === 'boolean') updates.isPremium = isPremium;
  if (premiumExpiry) updates.premiumExpiry = premiumExpiry;
  if (role) updates.role = role;

  await adminDb.collection('users').doc(uid).update(updates);
  return NextResponse.json({ success: true, uid, updates });
}

// DELETE: remove a user
export async function DELETE(req) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { uid } = await req.json();
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });

  await adminAuth.deleteUser(uid);
  await adminDb.collection('users').doc(uid).delete();
  return NextResponse.json({ success: true });
}
