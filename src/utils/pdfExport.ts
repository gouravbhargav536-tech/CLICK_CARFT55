import { ConversationSession } from '../types';

export function exportSessionPDF(session: ConversationSession, targetLangName: string) {
  if (!session || !session.messages || session.messages.length === 0) {
    alert('No transcript logs available in the active session to export.');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Please allow popups for this site to generate the PDF report.');
    return;
  }

  const sessionTitle = session.title || 'Voice Translation Session';
  const createdDate = new Date(session.createdAt || Date.now()).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const createdTime = new Date(session.createdAt || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const sourceLang = session.sourceLang || 'Auto Detect';
  const targetLang = session.targetLang || targetLangName || 'English';

  const userMessages = session.messages.filter((m) => m.role === 'user');
  const totalWords = session.messages.reduce((acc, m) => acc + (m.text ? m.text.split(' ').length : 0), 0);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AetherVoice_Bilingual_Report_${session.id}.pdf</title>
  <style>
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      padding: 32px;
      line-height: 1.5;
    }

    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #06b6d4;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0284c7;
      letter-spacing: -0.5px;
    }

    .brand-subtitle {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
    }

    .meta-badge {
      background-color: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 8px 16px;
      border-radius: 12px;
      text-align: right;
    }

    .meta-badge-title {
      font-size: 11px;
      font-weight: 700;
      color: #0369a1;
      text-transform: uppercase;
    }

    .meta-badge-date {
      font-size: 12px;
      color: #334155;
      font-weight: 500;
    }

    .session-title-card {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 20px;
      border-radius: 16px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .session-title-card h1 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.15);
    }

    .metric-item {
      font-size: 11px;
      color: #94a3b8;
    }

    .metric-value {
      font-size: 13px;
      font-weight: 700;
      color: #38bdf8;
      margin-top: 2px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .transcript-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 32px;
    }

    .transcript-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      background-color: #f8fafc;
      page-break-inside: avoid;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 11px;
      color: #64748b;
    }

    .speaker-badge {
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 10px;
      text-transform: uppercase;
    }

    .speaker-user {
      background-color: #e2e8f0;
      color: #334155;
    }

    .speaker-assistant {
      background-color: #e0f2fe;
      color: #0369a1;
    }

    .original-text {
      font-size: 14px;
      color: #1e293b;
      margin-bottom: 10px;
    }

    .translation-box {
      background-color: #ffffff;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #0284c7;
      padding: 12px;
      border-radius: 8px;
    }

    .translation-label {
      font-size: 10px;
      font-weight: 700;
      color: #0284c7;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .translated-text {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }

    .phonetic-note {
      font-size: 11px;
      font-family: monospace;
      color: #d97706;
      margin-top: 6px;
    }

    .cultural-note {
      font-size: 11px;
      color: #475569;
      font-style: italic;
      margin-top: 6px;
    }

    .report-footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #94a3b8;
    }

    .print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #0f172a;
      color: white;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 100;
    }

    .btn-print {
      background: #0284c7;
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }

    .btn-print:hover {
      background: #0369a1;
    }
  </style>
</head>
<body>
  <!-- Print Bar -->
  <div class="print-bar no-print">
    <div>
      <strong>AetherVoice PDF Report Generator</strong> — Click "Save as PDF" in the browser dialog.
    </div>
    <button class="btn-print" onclick="window.print()">🖨️ Save as PDF / Print</button>
  </div>

  <div style="margin-top: 40px;"></div>

  <!-- Header -->
  <div class="report-header">
    <div>
      <div class="brand-title">AetherVoice AI</div>
      <div class="brand-subtitle">Real-time Global Bilingual Report</div>
    </div>
    <div class="meta-badge">
      <div class="meta-badge-title">Official Transcript</div>
      <div class="meta-badge-date">${createdDate}</div>
    </div>
  </div>

  <!-- Session Title & Metrics -->
  <div class="session-title-card">
    <h1>${sessionTitle}</h1>
    <div class="metrics-grid">
      <div class="metric-item">
        Source Language
        <div class="metric-value">${sourceLang}</div>
      </div>
      <div class="metric-item">
        Target Language
        <div class="metric-value">${targetLang}</div>
      </div>
      <div class="metric-item">
        Total Exchanges
        <div class="metric-value">${userMessages.length} Interactions</div>
      </div>
      <div class="metric-item">
        Total Words Translated
        <div class="metric-value">${totalWords} Words</div>
      </div>
    </div>
  </div>

  <!-- Transcript Section -->
  <div class="section-title">
    <span>🌐 Bilingual Voice & Text Logs</span>
  </div>

  <div class="transcript-container">
    ${session.messages
      .map((msg, idx) => {
        const isUser = msg.role === 'user';
        return `
      <div class="transcript-card">
        <div class="card-meta">
          <span class="speaker-badge ${isUser ? 'speaker-user' : 'speaker-assistant'}">
            ${isUser ? 'User Input' : 'Gemini AI Stream Translation'}
          </span>
          <span>${msg.timestamp}</span>
        </div>
        
        <div class="original-text">
          ${msg.text}
        </div>

        ${
          msg.translatedText
            ? `
        <div class="translation-box">
          <div class="translation-label">Translated (${targetLang})</div>
          <div class="translated-text">${msg.translatedText}</div>
          ${msg.phoneticSpelling ? `<div class="phonetic-note">Phonetic: ${msg.phoneticSpelling}</div>` : ''}
          ${msg.culturalNotes ? `<div class="cultural-note">Note: ${msg.culturalNotes}</div>` : ''}
        </div>
        `
            : ''
        }
      </div>
      `;
      })
      .join('')}
  </div>

  <!-- Footer -->
  <div class="report-footer">
    <div>Generated securely via AetherVoice AI Stream & Gemini 3.6 Engine</div>
    <div>Session ID: ${session.id} | Confidential</div>
  </div>

  <script>
    // Auto trigger print window
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
