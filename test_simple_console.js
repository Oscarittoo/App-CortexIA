// =====================================================
// TEST SIMPLE - À COPIER-COLLER DANS LA CONSOLE (F12)
// =====================================================

// TEST 1: Vérifier si vous voyez la variable supabase
console.log('🔍 Supabase client disponible:', typeof window.supabase !== 'undefined' ? '✅ OUI' : '❌ NON');

// TEST 2: Importer depuis le service
import('./src/services/authService.js')
  .then(async (module) => {
    const { supabase } = module;
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║           TEST RÉCUPÉRATION CLIENTS DEPUIS SUPABASE        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    // Récupérer TOUS les clients (ce que fait getAllClients)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ ERREUR SUPABASE:', error);
      console.log('\n🔧 Actions à faire:');
      console.log('   1. Ouvrez fix_rls_permissions.sql');
      console.log('   2. Copiez le contenu');
      console.log('   3. Collez dans Supabase SQL Editor');
      console.log('   4. Cliquez sur RUN');
    } else {
      console.log(`✅ ${data.length} utilisateur(s) récupéré(s)\n`);
      
      data.forEach((client, i) => {
        console.log(`${i + 1}. EMAIL: ${client.email}`);
        console.log(`   Plan: ${client.plan}`);
        console.log(`   Entreprise: ${client.company_name || 'N/A'}`);
        console.log(`   Créé le: ${new Date(client.created_at).toLocaleString()}`);
        console.log('');
      });
      
      if (data.length === 1) {
        console.log('⚠️  PROBLÈME: Seulement 1 utilisateur visible');
        console.log('   Cause probable: RLS bloque l\'accès aux autres utilisateurs');
        console.log('   Solution: Exécutez fix_rls_permissions.sql dans Supabase\n');
      } else if (data.length >= 2) {
        console.log('✅ TOUT VA BIEN: Plusieurs utilisateurs sont visibles\n');
      }
    }
    
    // Vérifier l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Connecté en tant que:', user.email);
    console.log('   ID:', user.id);
    console.log('   Plan (metadata):', user.user_metadata?.plan || 'Non défini');
    
  })
  .catch(err => {
    console.error('❌ Impossible d\'importer le module:', err);
    console.log('\n💡 Essayez plutôt cette version:');
    console.log('   1. Allez dans l\'onglet Admin de l\'app');
    console.log('   2. Ouvrez la console (F12)');
    console.log('   3. Tapez: authService.getAllClients().then(console.log)');
  });
