import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DemoUser {
  email: string;
  password: string;
  username: string;
  role: string;
  first_name: string;
  last_name: string;
  company_id: string;
}

const demoUsers: DemoUser[] = [
  // TechCorp Solutions users
  {
    email: 'admin@techcorpsolutions.com',
    password: 'password123',
    username: 'admin',
    role: 'ICT',
    first_name: 'Admin',
    last_name: 'User',
    company_id: '11111111-1111-1111-1111-111111111111'
  },
  {
    email: 'finance@techcorpsolutions.com',
    password: 'password123',
    username: 'finance',
    role: 'Finance',
    first_name: 'Finance',
    last_name: 'Manager',
    company_id: '11111111-1111-1111-1111-111111111111'
  },
  {
    email: 'hr@techcorpsolutions.com',
    password: 'password123',
    username: 'hr',
    role: 'HR',
    first_name: 'HR',
    last_name: 'Manager',
    company_id: '11111111-1111-1111-1111-111111111111'
  },
  {
    email: 'safety@techcorpsolutions.com',
    password: 'password123',
    username: 'safety',
    role: 'Health and Safety',
    first_name: 'Safety',
    last_name: 'Officer',
    company_id: '11111111-1111-1111-1111-111111111111'
  },
  {
    email: 'logistics@techcorpsolutions.com',
    password: 'password123',
    username: 'logistics',
    role: 'Logistics',
    first_name: 'Logistics',
    last_name: 'Coordinator',
    company_id: '11111111-1111-1111-1111-111111111111'
  },
  // BuildMaster Construction users
  {
    email: 'admin@buildmaster.com',
    password: 'password123',
    username: 'admin',
    role: 'ICT',
    first_name: 'Build',
    last_name: 'Admin',
    company_id: '22222222-2222-2222-2222-222222222222'
  },
  {
    email: 'operations@buildmaster.com',
    password: 'password123',
    username: 'operations',
    role: 'Operations Manager',
    first_name: 'Operations',
    last_name: 'Manager',
    company_id: '22222222-2222-2222-2222-222222222222'
  },
  // GlobalNet Services users
  {
    email: 'admin@globalnet.com',
    password: 'password123',
    username: 'admin',
    role: 'ICT',
    first_name: 'Global',
    last_name: 'Admin',
    company_id: '33333333-3333-3333-3333-333333333333'
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create demo users
    for (const user of demoUsers) {
      console.log(`Creating user: ${user.email}`)
      
      // Create auth user
      const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          company_id: user.company_id,
          role: user.role
        }
      })

      if (authError) {
        console.error(`Error creating user ${user.email}:`, authError)
        continue
      }

      console.log(`Successfully created user: ${user.email}`)
    }

    // Insert demo materials (now that users exist)
    const materialsData = [
      // TechCorp materials
      {
        company_id: '11111111-1111-1111-1111-111111111111',
        name: 'Safety Helmet',
        category: 'Safety',
        description: 'Standard safety helmet with chin strap',
        unit: 'piece',
        unit_price: 25.50,
        stock_quantity: 50,
        minimum_stock: 10,
        created_by: demoUsers[0].email // admin user will be created by now
      },
      {
        company_id: '11111111-1111-1111-1111-111111111111',
        name: 'Fiber Optic Cable',
        category: 'FTTH',
        description: 'Single mode fiber optic cable 9/125',
        unit: 'meter',
        unit_price: 2.75,
        stock_quantity: 1000,
        minimum_stock: 100,
        created_by: demoUsers[0].email
      }
    ];

    // Get the created user IDs and insert materials
    for (const material of materialsData) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('email', material.created_by)
        .single();

      if (profile) {
        const { error: materialError } = await supabaseClient
          .from('materials')
          .insert([{
            ...material,
            created_by: profile.id
          }]);

        if (materialError) {
          console.error('Error inserting material:', materialError);
        }
      }
    }

    return new Response(
      JSON.stringify({ message: 'Demo data setup completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error setting up demo data:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to setup demo data' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})