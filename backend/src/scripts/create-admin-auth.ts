import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { supabaseAdmin } from '../lib/supabase';

async function run() {
  console.log('Creating admin@chessmate.in in Supabase Auth...');
  const { data: admin, error: adminError } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin@chessmate.in',
    password: 'AdminPassword123',
    email_confirm: true,
    user_metadata: {
      name: 'ChessMate Admin',
    }
  });

  if (adminError) {
    if (adminError.message.includes('already exists')) {
      console.log('Admin user already exists in Supabase Auth.');
    } else {
      console.error('Failed to create admin in Supabase Auth:', adminError.message);
    }
  } else {
    console.log('Successfully created admin user in Supabase Auth! ID:', admin.user.id);
  }

  console.log('\nCreating arjun@chessmate.in in Supabase Auth...');
  const { data: player, error: playerError } = await supabaseAdmin.auth.admin.createUser({
    email: 'arjun@chessmate.in',
    password: 'PlayerPassword123',
    email_confirm: true,
    user_metadata: {
      name: 'Arjun Kumar',
    }
  });

  if (playerError) {
    if (playerError.message.includes('already exists')) {
      console.log('Player user already exists in Supabase Auth.');
    } else {
      console.error('Failed to create player in Supabase Auth:', playerError.message);
    }
  } else {
    console.log('Successfully created player user in Supabase Auth! ID:', player.user.id);
  }
  
  console.log('\nDone creating auth users!');
}

run();
