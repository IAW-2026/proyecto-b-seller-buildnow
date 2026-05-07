import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { PrismaSellerRepository } from '../../../../infrastructure/repositories/prisma/PrismaSellerRepository';

const sellerRepo = new PrismaSellerRepository();

async function verificarFirmaClerk(req: Request): Promise<WebhookEvent | Response> {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error -- faltan headers de Svix', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    return wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verificando webhook:', err);
    return new Response('Firma inválida', { status: 400 });
  }
}

async function manejarCreacionOEdicion(data: WebhookEvent['data'] & {
  email_addresses: { email_address: string }[];
  first_name: string | null;
  last_name: string | null;
  public_metadata: Record<string, unknown>;
}): Promise<Response> {
  const { id, email_addresses, first_name, last_name, public_metadata } = data;

  const email = email_addresses[0]?.email_address;
  const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Vendedor';
  const incomingRole = public_metadata?.role as string | undefined;


  if (incomingRole !== 'seller' && incomingRole !== 'admin') {
    console.log(`Webhook ignorado: El usuario ${id} tiene rol '${incomingRole}' (no pertenece a esta app)`);
    return new Response('Usuario ignorado: No es seller ni admin', { status: 200 });
  }

  const role = incomingRole === 'admin' ? 'ADMIN' : 'SELLER';

  if (!email) {
    return new Response('No se encontró email', { status: 400 });
  }

  if (!id) {
    return new Response('No se encontró ID de usuario', { status: 400 });
  }

  try {
    const existingUser = await sellerRepo.findById(id);

    if (existingUser) {
      await sellerRepo.update(id, { name, email, role });
    } else {
      await sellerRepo.create({ id, name, email, role, storeId: null });
    }

    return new Response('Usuario sincronizado', { status: 200 });
  } catch (error) {
    console.error('Error sincronizando usuario en la base de datos:', error);
    return new Response('Error de base de datos', { status: 500 });
  }
}

async function manejarEliminacion(data: WebhookEvent['data'] & { id?: string }): Promise<Response> {
  const { id } = data;

  if (!id) {
    return new Response('No se encontró ID de usuario', { status: 400 });
  }

  try {
    await sellerRepo.delete(id);
    return new Response('Usuario eliminado', { status: 200 });
  } catch (error) {
    console.error('Error eliminando usuario de la base de datos:', error);
    return new Response('Error de base de datos', { status: 500 });
  }
}


export async function POST(req: Request) {
  const resultado = await verificarFirmaClerk(req);

  if (resultado instanceof Response) {
    return resultado;
  }

  const evt = resultado;

  switch (evt.type) {
    case 'user.created':
    case 'user.updated':
      return manejarCreacionOEdicion(evt.data as Parameters<typeof manejarCreacionOEdicion>[0]);
    case 'user.deleted':
      return manejarEliminacion(evt.data as Parameters<typeof manejarEliminacion>[0]);
    default:
      return new Response('Evento no manejado', { status: 200 });
  }
}
