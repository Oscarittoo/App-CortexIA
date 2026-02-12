// =====================================================
// TEST DE DIAGNOSTIC - À EXÉCUTER DANS LA CONSOLE DU NAVIGATEUR
// =====================================================
// 
// 1. Ouvrez l'application Meetizy dans votre navigateur
// 2. Appuyez sur F12 pour ouvrir la console
// 3. Copiez et collez TOUT ce script
// 4. Appuyez sur Entrée
// 5. Lisez les résultats qui s'affichent
//
// =====================================================

(async function testSupabaseClients() {
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        TEST DE DIAGNOSTIC SUPABASE - BASE CLIENTS        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Importer Supabase depuis le module
    const { supabase } = await import('./services/authService.js');
    
    console.log('✅ Supabase importé avec succès\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 1 : Récupération SANS filtre (ce que fait getAllClients actuellement)
    console.log('🔍 TEST 1 : Récupération normale (avec RLS)');
    console.log('------------------------------------------------');
    const { data: normalData, error: normalError } = await supabase
      .from('clients')
      .select('*');

    if (normalError) {
      console.error('❌ ERREUR:', normalError.message);
      console.error('Code:', normalError.code);
      console.error('Détails:', normalError.details);
    } else {
      console.log(`✅ Nombre d'utilisateurs récupérés: ${normalData?.length || 0}`);
      console.log('📋 Liste des utilisateurs:');
      normalData.forEach((client, index) => {
        console.log(`   ${index + 1}. ${client.email} (${client.plan})`);
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 2 : Vérifier l'utilisateur actuellement connecté
    console.log('🔍 TEST 2 : Utilisateur actuellement connecté');
    console.log('------------------------------------------------');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ ERREUR:', userError.message);
    } else {
      console.log('✅ Utilisateur connecté:');
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Métadonnées:`, user.user_metadata);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 3 : Vérifier les politiques RLS
    console.log('🔍 TEST 3 : Analyse des politiques RLS');
    console.log('------------------------------------------------');
    console.log('⚠️  Si vous ne voyez qu\'un seul utilisateur ci-dessus,');
    console.log('    cela signifie que les politiques RLS bloquent l\'accès.');
    console.log('');
    console.log('📝 Pour corriger, exécutez dans Supabase SQL Editor:');
    console.log('    → Ouvrez le fichier: fix_rls_permissions.sql');
    console.log('    → Copiez tout le contenu');
    console.log('    → Collez dans SQL Editor et cliquez sur "Run"');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 4 : Compter le nombre réel d'utilisateurs dans Auth
    console.log('🔍 TEST 4 : Nombre d\'utilisateurs dans Auth (si accessible)');
    console.log('------------------------------------------------');
    console.log('⚠️  Cette information n\'est pas accessible côté client');
    console.log('    Vous devez l\'obtenir via Supabase Dashboard → Authentication');
    console.log('    ou en exécutant diagnostic_supabase.sql dans SQL Editor');

    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    RÉSUMÉ DU DIAGNOSTIC                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Utilisateurs visibles dans l'application: ${normalData?.length || 0}`);
    console.log(`\n👤 Connecté en tant que: ${user?.email || 'Inconnu'}`);
    
    if (normalData?.length === 1) {
      console.log('\n❌ PROBLÈME IDENTIFIÉ:');
      console.log('   → Vous ne voyez qu\'un seul utilisateur');
      console.log('   → Cause probable: Politiques RLS trop restrictives');
      console.log('   → Solution: Exécutez fix_rls_permissions.sql dans Supabase');
    } else if (normalData?.length > 1) {
      console.log('\n✅ TOUT FONCTIONNE CORRECTEMENT');
      console.log(`   → ${normalData.length} utilisateurs sont visibles`);
    } else {
      console.log('\n⚠️  PROBLÈME CRITIQUE:');
      console.log('   → Aucun utilisateur visible');
      console.log('   → Vérifiez que la table "clients" existe dans Supabase');
      console.log('   → Exécutez force_sync_users.sql dans Supabase');
    }

    console.log('\n\n');

  } catch (error) {
    console.error('\n\n❌ ERREUR CRITIQUE LORS DU TEST:\n');
    console.error(error);
    console.log('\n💡 SOLUTION:');
    console.log('   Si vous voyez une erreur d\'import, essayez plutôt:');
    console.log('   1. Ouvrez l\'onglet Network dans les DevTools (F12)');
    console.log('   2. Rechargez la page');
    console.log('   3. Cherchez les requêtes vers Supabase');
    console.log('   4. Vérifiez les réponses pour voir combien d\'utilisateurs sont retournés');
  }
})();
