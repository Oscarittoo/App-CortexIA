/**
 * Script de génération de PDFs à partir des documents Markdown
 * Usage: node generate-pdfs.js
 */

const fs = require('fs');
const path = require('path');
const mdToPdf = require('md-to-pdf').mdToPdf;

// Liste des fichiers à convertir
const files = [
  'DOCUMENTATION_TECHNIQUE.md',
  'PRESENTATION_COMMERCIALE.md',
  'RAPPORT_EQUIPE.md',
  'SESSION_HISTORY.md',
  'README.md',
  'DESIGN_SYSTEM.md',
  'IDENTITE_VISUELLE.md'
];

// Dossier de sortie pour les PDFs
const outputDir = path.join(__dirname, 'docs-pdf');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Configuration du style PDF
const pdfConfig = {
  stylesheet: [
    'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown.min.css'
  ],
  body_class: 'markdown-body',
  css: `
    .markdown-body {
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #24292f;
    }
    
    .markdown-body h1 {
      border-bottom: 1px solid #d0d7de;
      padding-bottom: 0.3em;
      font-size: 2em;
      margin-top: 24px;
      margin-bottom: 16px;
    }
    
    .markdown-body h2 {
      border-bottom: 1px solid #d0d7de;
      padding-bottom: 0.3em;
      font-size: 1.5em;
      margin-top: 24px;
      margin-bottom: 16px;
    }
    
    .markdown-body code {
      background-color: rgba(175, 184, 193, 0.2);
      padding: 0.2em 0.4em;
      border-radius: 6px;
      font-size: 85%;
    }
    
    .markdown-body pre {
      background-color: #f6f8fa;
      border-radius: 6px;
      padding: 16px;
      overflow: auto;
    }
    
    .markdown-body table {
      border-collapse: collapse;
      width: 100%;
    }
    
    .markdown-body table th,
    .markdown-body table td {
      border: 1px solid #d0d7de;
      padding: 6px 13px;
    }
    
    .markdown-body table tr:nth-child(2n) {
      background-color: #f6f8fa;
    }
    
    @page {
      margin: 20mm;
    }
  `,
  pdf_options: {
    format: 'A4',
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    printBackground: true
  },
  marked_options: {
    headerIds: true,
    mangle: false
  }
};

// Fonction principale
async function generatePDFs() {
  console.log('🚀 Démarrage de la génération des PDFs...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const inputPath = path.join(__dirname, file);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  ${file} - Fichier non trouvé, ignoré`);
      continue;
    }
    
    const outputPath = path.join(outputDir, file.replace('.md', '.pdf'));
    
    try {
      console.log(`📄 Conversion de ${file}...`);
      
      // Convertir le fichier
      await mdToPdf(
        { path: inputPath },
        { 
          dest: outputPath,
          ...pdfConfig
        }
      );
      
      console.log(`✅ ${file} → ${path.basename(outputPath)}\n`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Erreur lors de la conversion de ${file}:`);
      console.error(error.message);
      console.log('');
      errorCount++;
    }
  }
  
  console.log('━'.repeat(50));
  console.log(`\n✨ Génération terminée !`);
  console.log(`   Succès: ${successCount} fichiers`);
  console.log(`   Erreurs: ${errorCount} fichiers`);
  console.log(`   Dossier: ${outputDir}\n`);
}

// Exécuter
generatePDFs().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
