/**
 * DecodeLabs - Cryptographic Sandbox
 * Project 2: Basic Encryption & Decryption
 * 
 * Script implementing ciphers, interactive visualizations,
 * data metrics, and emulation console.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- APPLICATION STATE ---
  const state = {
    activeCipher: 'caesar',
    caesarShift: 3,
    vigenereKey: 'DECODE',
    preserveCase: true,
    ignoreSymbols: true,
    realtime: true,
    
    plaintext: '',
    ciphertext: '',
    decryptedtext: '',
    
    // Badge unlocking tracker
    hasTyped: false,
    hasCopied: false,
    integrityVerified: false,
    badgeUnlocked: false
  };

  // --- UI DOM ELEMENTS ---
  const el = {
    // Inputs & Toggles
    btnCaesar: document.getElementById('btn-caesar'),
    btnVigenere: document.getElementById('btn-vigenere'),
    paramsCaesar: document.getElementById('params-caesar'),
    paramsVigenere: document.getElementById('params-vigenere'),
    caesarShift: document.getElementById('caesar-shift'),
    caesarShiftVal: document.getElementById('caesar-shift-val'),
    vigenereKey: document.getElementById('vigenere-key'),
    togglePreserveCase: document.getElementById('toggle-preserve-case'),
    toggleIgnoreSymbols: document.getElementById('toggle-ignore-symbols'),
    toggleRealtime: document.getElementById('toggle-realtime'),
    
    // Workspace Textareas
    plaintextInput: document.getElementById('plaintext-input'),
    ciphertextOutput: document.getElementById('ciphertext-output'),
    decryptedOutput: document.getElementById('decrypted-output'),
    plaintextCount: document.getElementById('plaintext-count'),
    
    // Action Buttons
    btnEncryptDir: document.getElementById('btn-encrypt-dir'),
    btnDecryptDir: document.getElementById('btn-decrypt-dir'),
    btnReset: document.getElementById('btn-reset'),
    btnCopyCipher: document.getElementById('btn-copy-cipher'),
    integrityBadge: document.getElementById('integrity-badge'),
    integrityText: document.getElementById('integrity-text'),
    
    // Visualizer tabs
    tabWheel: document.getElementById('tab-wheel'),
    tabGrid: document.getElementById('tab-grid'),
    tabBrute: document.getElementById('tab-brute'),
    viewWheel: document.getElementById('view-wheel'),
    viewGrid: document.getElementById('view-grid'),
    viewBrute: document.getElementById('view-brute'),
    
    // Caesar Wheel graphics
    cipherWheelSvg: document.getElementById('cipher-wheel-svg'),
    wheelShiftRule: document.getElementById('wheel-shift-rule'),
    wheelPlainChar: document.getElementById('wheel-plain-char'),
    wheelCipherChar: document.getElementById('wheel-cipher-char'),
    
    // Vigenere tabula recta
    tabulaWrapper: document.getElementById('tabula-wrapper'),
    
    // Brute force list
    bruteList: document.getElementById('brute-list'),
    
    // Analytics
    entropyPlain: document.getElementById('entropy-plain'),
    entropyCipher: document.getElementById('entropy-cipher'),
    entropyBarPlain: document.getElementById('entropy-bar-plain'),
    entropyBarCipher: document.getElementById('entropy-bar-cipher'),
    freqBarsViewport: document.getElementById('freq-bars-viewport'),
    
    // Terminal Log
    terminalLogs: document.getElementById('terminal-logs'),
    btnClearLogs: document.getElementById('btn-clear-logs'),
    
    // Badge unlocking
    badgeLockIcon: document.getElementById('badge-lock-icon'),
    badgeProgressText: document.getElementById('badge-progress-text'),
    badgeModal: document.getElementById('badge-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnClaimBadge: document.getElementById('btn-claim-badge'),
  };

  // --- INITIALIZE GRAPHICS AND TABLES ---
  initCaesarWheel();
  initTabulaRecta();
  logTerminal('INFO', 'DECODELABS CRYPTOGRAPHIC ENGINE STARTED');
  logTerminal('INFO', 'Secure Sandbox listening on state interfaces.');
  
  // Set initial ciphers state
  updateCipherParameters();
  processCryptographicFlow();
  
  // --- EVENT LISTENERS ---
  
  // Switch Cipher Algorithm
  el.btnCaesar.addEventListener('click', () => setCipherAlgorithm('caesar'));
  el.btnVigenere.addEventListener('click', () => setCipherAlgorithm('vigenere'));
  
  // Caesar Shift input
  el.caesarShift.addEventListener('input', (e) => {
    state.caesarShift = parseInt(e.target.value);
    el.caesarShiftVal.textContent = state.caesarShift;
    
    // Instantly rotate CSS transform wheel graphic
    rotateWheelGraphic(state.caesarShift);
    updateWheelLabels();
    
    logTerminal('INFO', `Caesar Key shift set to ${state.caesarShift}`);
    
    if (state.realtime) processCryptographicFlow();
  });

  // Vigenere Key input
  el.vigenereKey.addEventListener('input', (e) => {
    // Sanitize input: only alphabetic characters
    let val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    e.target.value = val;
    state.vigenereKey = val || 'DECODE'; // Fallback to DECODE if empty
    
    logTerminal('INFO', `Vigenère Secret Key updated: "${state.vigenereKey}"`);
    
    // Highlight first matching character coordinate on the Vigenère Grid
    highlightGridCoordinate(0);
    
    if (state.realtime) processCryptographicFlow();
  });

  // Engine Config Settings
  el.togglePreserveCase.addEventListener('change', (e) => {
    state.preserveCase = e.target.checked;
    logTerminal('INFO', `Preserve Casing toggle set to ${state.preserveCase}`);
    processCryptographicFlow();
  });

  el.toggleIgnoreSymbols.addEventListener('change', (e) => {
    state.ignoreSymbols = e.target.checked;
    logTerminal('INFO', `Ignore spaces & symbols toggle set to ${state.ignoreSymbols}`);
    processCryptographicFlow();
  });

  el.toggleRealtime.addEventListener('change', (e) => {
    state.realtime = e.target.checked;
    logTerminal('INFO', `Realtime processing set to ${state.realtime}`);
  });

  // Plaintext text inputs
  el.plaintextInput.addEventListener('input', (e) => {
    state.plaintext = e.target.value;
    el.plaintextCount.textContent = `${state.plaintext.length} chars`;
    if (state.plaintext.length > 0) {
      state.hasTyped = true;
    }
    
    if (state.realtime) {
      processCryptographicFlow();
    }
  });

  // Direct actions trigger buttons
  el.btnEncryptDir.addEventListener('click', () => {
    logTerminal('INFO', 'Manual trigger: Initiating Encryption cycle...');
    processCryptographicFlow();
  });

  el.btnDecryptDir.addEventListener('click', () => {
    logTerminal('INFO', 'Manual trigger: Initiating Decryption cycle...');
    processCryptographicFlow();
  });

  // Reset Button
  el.btnReset.addEventListener('click', () => {
    el.plaintextInput.value = '';
    state.plaintext = '';
    state.caesarShift = 3;
    el.caesarShift.value = 3;
    el.caesarShiftVal.textContent = '3';
    el.vigenereKey.value = 'DECODE';
    state.vigenereKey = 'DECODE';
    el.togglePreserveCase.checked = true;
    state.preserveCase = true;
    el.toggleIgnoreSymbols.checked = true;
    state.ignoreSymbols = true;
    el.plaintextCount.textContent = '0 chars';
    
    rotateWheelGraphic(3);
    updateWheelLabels();
    highlightGridCoordinate(0);
    
    logTerminal('WARN', 'All parameters and workspace inputs reset.');
    processCryptographicFlow();
  });

  // Copy Ciphertext
  el.btnCopyCipher.addEventListener('click', () => {
    if (!state.ciphertext) {
      logTerminal('ERROR', 'No ciphertext available to copy.');
      return;
    }
    navigator.clipboard.writeText(state.ciphertext)
      .then(() => {
        logTerminal('SUCCESS', 'Ciphertext copied to clipboard.');
        state.hasCopied = true;
        checkBadgeUnlockProgress();
      })
      .catch(err => {
        logTerminal('ERROR', 'Failed to copy text to clipboard: ' + err);
      });
  });

  // Clear Logs console
  el.btnClearLogs.addEventListener('click', () => {
    el.terminalLogs.innerHTML = '';
    logTerminal('INFO', 'Console logs cleared.');
  });

  // Visualizer Tab Navigation
  const tabs = [el.tabWheel, el.tabGrid, el.tabBrute];
  const views = [el.viewWheel, el.viewGrid, el.viewBrute];

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));
      
      tab.classList.add('active');
      const targetView = document.getElementById(`view-${tab.dataset.tab}`);
      targetView.classList.add('active');
      
      logTerminal('INFO', `Switched visualization viewport to "${tab.textContent}"`);
    });
  });

  // Close modal dialogs
  el.btnCloseModal.addEventListener('click', () => {
    el.badgeModal.classList.remove('active');
  });

  el.btnClaimBadge.addEventListener('click', () => {
    logTerminal('SUCCESS', 'Badge successfully claimed! Internship milestone certified.');
    el.badgeModal.classList.remove('active');
  });

  // --- ENGINE ALGORITHMS ---

  function setCipherAlgorithm(cipher) {
    if (state.activeCipher === cipher) return;
    
    state.activeCipher = cipher;
    
    if (cipher === 'caesar') {
      el.btnCaesar.classList.add('active');
      el.btnVigenere.classList.remove('active');
      
      // Select corresponding tab automatically
      el.tabWheel.click();
    } else {
      el.btnCaesar.classList.remove('active');
      el.btnVigenere.classList.add('active');
      
      el.tabGrid.click();
    }
    
    updateCipherParameters();
    logTerminal('INFO', `Engine cipher algorithm toggled to ${cipher.toUpperCase()}`);
    processCryptographicFlow();
  }

  function updateCipherParameters() {
    if (state.activeCipher === 'caesar') {
      el.paramsCaesar.classList.add('active');
      el.paramsVigenere.classList.remove('active');
    } else {
      el.paramsCaesar.classList.remove('active');
      el.paramsVigenere.classList.add('active');
    }
  }

  function isLetter(char) {
    return /[a-zA-Z]/.test(char);
  }

  // --- CRYPTOGRAPHIC ENGINE EXECUTION LOOP ---
  function processCryptographicFlow() {
    state.plaintext = el.plaintextInput.value;
    
    let encrypted = "";
    let decrypted = "";
    
    // Performance benchmarking start
    const t0 = performance.now();
    
    if (state.activeCipher === 'caesar') {
      encrypted = runCaesarEncryption(state.plaintext, state.caesarShift, state.preserveCase, state.ignoreSymbols);
      decrypted = runCaesarDecryption(encrypted, state.caesarShift, state.preserveCase, state.ignoreSymbols);
    } else if (state.activeCipher === 'vigenere') {
      encrypted = runVigenereEncryption(state.plaintext, state.vigenereKey, state.preserveCase, state.ignoreSymbols);
      decrypted = runVigenereDecryption(encrypted, state.vigenereKey, state.preserveCase, state.ignoreSymbols);
    }
    
    const t1 = performance.now();
    const processTime = (t1 - t0).toFixed(3);
    
    state.ciphertext = encrypted;
    state.decryptedtext = decrypted;
    
    // Update Outputs
    el.ciphertextOutput.value = encrypted;
    el.decryptedOutput.value = decrypted;
    
    // Update Integrity indicators
    verifyDataIntegrity();
    
    // Update visual layouts
    updateAnalytics();
    
    if (state.plaintext.length > 0) {
      logTerminal('SUCCESS', `Obfuscation complete in ${processTime}ms. Input length: ${state.plaintext.length} chars.`);
      
      // Update interactive visual states
      if (state.activeCipher === 'caesar') {
        updateWheelLabels();
        updateBruteForceList(encrypted);
      } else {
        updateVigenereHighlight();
      }
    } else {
      // Clear charts if empty
      updateBruteForceList("");
    }

    checkBadgeUnlockProgress();
  }

  // --- CAESAR ENCRYPTION ALGORITHMS ---

  function runCaesarEncryption(text, shift, preserveCase, ignoreSymbols) {
    let result = "";
    for (let char of text) {
      if (isLetter(char)) {
        let code = char.charCodeAt(0);
        let isUpper = char === char.toUpperCase();
        let base = isUpper ? 65 : 97;
        
        let newChar = String.fromCharCode(((code - base + shift) % 26) + base);
        
        if (preserveCase) {
          result += newChar;
        } else {
          result += newChar.toUpperCase();
        }
      } else {
        if (!ignoreSymbols) {
          result += char;
        }
      }
    }
    return result;
  }

  function runCaesarDecryption(ciphertext, shift, preserveCase, ignoreSymbols) {
    // Decrypting Caesar is encrypting using the additive inverse (26 - shift)
    return runCaesarEncryption(ciphertext, (26 - shift) % 26, preserveCase, false);
  }

  // --- VIGENÈRE ENCRYPTION ALGORITHMS ---

  function runVigenereEncryption(text, key, preserveCase, ignoreSymbols) {
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!key) return text;
    
    let result = "";
    let keyIndex = 0;
    
    for (let char of text) {
      if (isLetter(char)) {
        let isUpper = char === char.toUpperCase();
        let base = isUpper ? 65 : 97;
        let shift = key.charCodeAt(keyIndex % key.length) - 65;
        
        let code = char.charCodeAt(0);
        let newChar = String.fromCharCode(((code - base + shift) % 26) + base);
        
        if (preserveCase) {
          result += newChar;
        } else {
          result += newChar.toUpperCase();
        }
        
        keyIndex++;
      } else {
        if (!ignoreSymbols) {
          result += char;
        }
      }
    }
    return result;
  }

  function runVigenereDecryption(ciphertext, key, preserveCase, ignoreSymbols) {
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!key) return ciphertext;
    
    let result = "";
    let keyIndex = 0;
    
    for (let char of ciphertext) {
      if (isLetter(char)) {
        let isUpper = char === char.toUpperCase();
        let base = isUpper ? 65 : 97;
        let shift = key.charCodeAt(keyIndex % key.length) - 65;
        
        let code = char.charCodeAt(0);
        let newChar = String.fromCharCode(((code - base - shift + 26) % 26) + base);
        
        if (preserveCase) {
          result += newChar;
        } else {
          result += newChar.toUpperCase();
        }
        
        keyIndex++;
      } else {
        if (!ignoreSymbols) {
          result += char;
        }
      }
    }
    return result;
  }

  // --- DATA INTEGRITY CHECK ---
  function verifyDataIntegrity() {
    const originalText = el.plaintextInput.value;
    const decryptedText = el.decryptedOutput.value;
    
    if (originalText.length > 0 && originalText === decryptedText) {
      el.integrityBadge.className = 'integrity-badge integrity-pass';
      el.integrityText.textContent = 'INTEGRITY PASS';
      state.integrityVerified = true;
    } else {
      el.integrityBadge.className = 'integrity-badge integrity-fail';
      el.integrityText.textContent = 'NOT VERIFIED';
      state.integrityVerified = false;
    }
  }

  // --- GRAPHICAL RENDERERS ---

  // Caesar Wheel Generator (SVG)
  function initCaesarWheel() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let svgContent = "";
    
    // Draw concentric circles
    svgContent += `<circle cx="160" cy="160" r="145" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2" />`;
    svgContent += `<circle cx="160" cy="160" r="115" fill="rgba(10,15,30,0.4)" stroke="rgba(0, 242, 254, 0.2)" stroke-width="1.5" />`;
    svgContent += `<circle cx="160" cy="160" r="85" fill="rgba(10,15,30,0.6)" stroke="rgba(157, 78, 221, 0.2)" stroke-width="1.5" />`;
    svgContent += `<circle cx="160" cy="160" r="50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />`;
    
    // Generate text items (Outer alphabet - fixed plaintext)
    for (let i = 0; i < 26; i++) {
      let angle = (i * 360 / 26) - 90; // Align A at the top
      let angleRad = angle * Math.PI / 180;
      
      let xOuter = 160 + 130 * Math.cos(angleRad);
      let yOuter = 160 + 130 * Math.sin(angleRad);
      
      svgContent += `
        <text x="${xOuter}" y="${yOuter + 4}" 
              text-anchor="middle" 
              font-family="Outfit" 
              font-size="12" 
              font-weight="700" 
              fill="#94a3b8" 
              transform="rotate(${angle + 90}, ${xOuter}, ${yOuter})">
          ${alphabet[i]}
        </text>
      `;
    }
    
    // Generate inner alphabet container (grouped for rotation transformation)
    let innerGroup = `<g id="wheel-inner-group" style="transform-origin: 160px 160px; transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);">`;
    for (let i = 0; i < 26; i++) {
      let angle = (i * 360 / 26) - 90;
      let angleRad = angle * Math.PI / 180;
      
      let xInner = 160 + 100 * Math.cos(angleRad);
      let yInner = 160 + 100 * Math.sin(angleRad);
      
      innerGroup += `
        <text x="${xInner}" y="${yInner + 3}" 
              text-anchor="middle" 
              font-family="Outfit" 
              font-size="11" 
              font-weight="700" 
              fill="#00f2fe" 
              transform="rotate(${angle + 90}, ${xInner}, ${yInner})">
          ${alphabet[i]}
        </text>
      `;
    }
    innerGroup += `</g>`;
    svgContent += innerGroup;
    
    el.cipherWheelSvg.innerHTML = svgContent;
    rotateWheelGraphic(state.caesarShift);
  }

  function rotateWheelGraphic(shift) {
    const innerGroup = document.getElementById('wheel-inner-group');
    if (innerGroup) {
      // Rotation angle is negative because shift moves characters right, meaning inner wheel shifts left (anti-clockwise)
      const angle = -shift * (360 / 26);
      innerGroup.style.transform = `rotate(${angle}deg)`;
    }
  }

  function updateWheelLabels() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    el.wheelShiftRule.textContent = `X \u2192 (X + ${state.caesarShift}) mod 26`;
    
    // Show mapping of focused char (usually first character of input text, fallback to A)
    let activeChar = "A";
    if (state.plaintext.length > 0) {
      let firstChar = state.plaintext[0].toUpperCase();
      if (alphabet.includes(firstChar)) {
        activeChar = firstChar;
      }
    }
    
    let plainIndex = alphabet.indexOf(activeChar);
    let cipherIndex = (plainIndex + state.caesarShift) % 26;
    let cipherChar = alphabet[cipherIndex];
    
    el.wheelPlainChar.textContent = activeChar;
    el.wheelCipherChar.textContent = cipherChar;
  }

  // Vigenere Tabula Recta Grid Generator
  function initTabulaRecta() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let html = `<table class="tabula-table" id="tabula-grid-table">`;
    
    // Header Row
    html += `<thead><tr><th class="header-corner">K \\ P</th>`;
    for (let c = 0; c < 26; c++) {
      html += `<th>${alphabet[c]}</th>`;
    }
    html += `</tr></thead><tbody>`;
    
    // Rows
    for (let r = 0; r < 26; r++) {
      html += `<tr>`;
      html += `<th>${alphabet[r]}</th>`; // Row label (Key letter)
      
      for (let c = 0; c < 26; c++) {
        let shiftIndex = (r + c) % 26;
        let char = alphabet[shiftIndex];
        html += `<td data-row="${r}" data-col="${c}" id="cell-${r}-${c}">${char}</td>`;
      }
      html += `</tr>`;
    }
    
    html += `</tbody></table>`;
    el.tabulaWrapper.innerHTML = html;
    
    // Add cell click handler to explain the intersection
    const cells = el.tabulaWrapper.querySelectorAll('td');
    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        let r = parseInt(cell.dataset.row);
        let c = parseInt(cell.dataset.col);
        let plainLetter = alphabet[c];
        let keyLetter = alphabet[r];
        let cipherLetter = alphabet[(r + c) % 26];
        
        logTerminal('INFO', `Tabula Recta: Row [Key] ${keyLetter} \u2229 Col [Plain] ${plainLetter} = ${cipherLetter}`);
        
        // Custom interactive highlight on user click
        clearTabulaHighlights();
        highlightCellCoordinates(r, c);
      });
    });
  }

  function clearTabulaHighlights() {
    const table = document.getElementById('tabula-grid-table');
    if (!table) return;
    const cells = table.querySelectorAll('td, th');
    cells.forEach(c => c.classList.remove('highlight-plain', 'highlight-key', 'highlight-intersect'));
  }

  function highlightCellCoordinates(row, col) {
    const table = document.getElementById('tabula-grid-table');
    if (!table) return;
    
    // Highlight Row Header
    const rowHeader = table.querySelector(`tbody tr:nth-child(${row + 1}) th`);
    if (rowHeader) rowHeader.classList.add('highlight-key');
    
    // Highlight Col Header
    const colHeader = table.querySelector(`thead th:nth-child(${col + 2})`);
    if (colHeader) colHeader.classList.add('highlight-plain');
    
    // Highlight intermediate Row elements
    for (let c = 0; c < 26; c++) {
      if (c === col) continue;
      document.getElementById(`cell-${row}-${c}`).classList.add('highlight-key');
    }
    
    // Highlight intermediate Col elements
    for (let r = 0; r < 26; r++) {
      if (r === row) continue;
      document.getElementById(`cell-${r}-${col}`).classList.add('highlight-plain');
    }
    
    // Highlight Intersect Element
    const intersect = document.getElementById(`cell-${row}-${col}`);
    if (intersect) intersect.classList.add('highlight-intersect');
  }

  // Visual highlight mapping based on current text focus (e.g. index 0 of key/plaintext)
  function updateVigenereHighlight() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (state.plaintext.length === 0 || !state.vigenereKey) {
      clearTabulaHighlights();
      return;
    }
    
    // Use first valid letter of plaintext and first letter of secret key
    let plainChar = state.plaintext.toUpperCase().replace(/[^A-Z]/g, '')[0];
    let keyChar = state.vigenereKey.toUpperCase().replace(/[^A-Z]/g, '')[0];
    
    if (!plainChar || !keyChar) {
      clearTabulaHighlights();
      return;
    }
    
    let plainIndex = alphabet.indexOf(plainChar);
    let keyIndex = alphabet.indexOf(keyChar);
    
    clearTabulaHighlights();
    highlightCellCoordinates(keyIndex, plainIndex);
  }

  function highlightGridCoordinate(index) {
    // Helper to highlight key coordinate on demand
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let keyLetter = state.vigenereKey[index % state.vigenereKey.length];
    if (keyLetter) {
      let row = alphabet.indexOf(keyLetter);
      clearTabulaHighlights();
      highlightCellCoordinates(row, 0); // show on col A
    }
  }

  // Caesar Permutations Brute Force List Builder
  function updateBruteForceList(ciphertext) {
    if (!ciphertext) {
      el.bruteList.innerHTML = `<div class="p-16 text-center text-muted">Enter input message to calculate brute force permutations</div>`;
      return;
    }
    
    let html = "";
    for (let shift = 1; shift < 26; shift++) {
      // Decode Caesar shift by running inverse shift (26 - shift)
      let decryptedCandidate = runCaesarDecryption(ciphertext, shift, state.preserveCase, state.ignoreSymbols);
      let isActive = (shift === state.caesarShift && state.activeCipher === 'caesar');
      
      html += `
        <div class="brute-item ${isActive ? 'active-shift' : ''}" data-shift="${shift}">
          <span class="brute-num">ROT +${shift}</span>
          <span class="brute-text">${escapeHtml(decryptedCandidate)}</span>
          <span class="brute-apply">APPLY KEY</span>
        </div>
      `;
    }
    
    el.bruteList.innerHTML = html;
    
    // Add brute items selection handlers
    const items = el.bruteList.querySelectorAll('.brute-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const shiftVal = parseInt(item.dataset.shift);
        state.caesarShift = shiftVal;
        el.caesarShift.value = shiftVal;
        el.caesarShiftVal.textContent = shiftVal;
        
        rotateWheelGraphic(shiftVal);
        updateWheelLabels();
        
        logTerminal('WARN', `Brute force override: Caesar key shift updated to ROT +${shiftVal}`);
        
        // Force Caesar cipher activation
        if (state.activeCipher !== 'caesar') {
          setCipherAlgorithm('caesar');
        } else {
          processCryptographicFlow();
        }
      });
    });
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- CRYPTANALYSIS METRICS ENGINE ---

  function updateAnalytics() {
    const textPlain = el.plaintextInput.value;
    const textCipher = el.ciphertextOutput.value;
    
    // 1. Calculate Shannon Entropy
    const entropyP = calcShannonEntropy(textPlain);
    const entropyC = calcShannonEntropy(textCipher);
    
    el.entropyPlain.textContent = entropyP.toFixed(2);
    el.entropyCipher.textContent = entropyC.toFixed(2);
    
    // Calculate percentage fill relative to maximum theoretical value (approx log2(26) = 4.7)
    let percentPlain = Math.min((entropyP / 4.7) * 100, 100);
    let percentCipher = Math.min((entropyC / 4.7) * 100, 100);
    
    el.entropyBarPlain.style.width = `${percentPlain}%`;
    el.entropyBarCipher.style.width = `${percentCipher}%`;
    
    // 2. Render Character Frequency Histogram
    renderFrequencyChart(textPlain, textCipher);
  }

  function calcShannonEntropy(text) {
    if (!text) return 0.00;
    
    // Filter to count letters only or process raw characters depending on state
    let targetText = state.ignoreSymbols ? text.toUpperCase().replace(/[^A-Z]/g, '') : text;
    if (targetText.length === 0) return 0.00;
    
    let freqs = {};
    for (let i = 0; i < targetText.length; i++) {
      let char = targetText[i];
      freqs[char] = (freqs[char] || 0) + 1;
    }
    
    let entropy = 0.0;
    const len = targetText.length;
    
    for (let char in freqs) {
      let p = freqs[char] / len;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }

  function renderFrequencyChart(plain, cipher) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const plainFreq = new Array(26).fill(0);
    const cipherFreq = new Array(26).fill(0);
    
    const cleanPlain = plain.toUpperCase().replace(/[^A-Z]/g, '');
    const cleanCipher = cipher.toUpperCase().replace(/[^A-Z]/g, '');
    
    // Count occurrences
    for (let char of cleanPlain) {
      let idx = alphabet.indexOf(char);
      if (idx !== -1) plainFreq[idx]++;
    }
    for (let char of cleanCipher) {
      let idx = alphabet.indexOf(char);
      if (idx !== -1) cipherFreq[idx]++;
    }
    
    // Calculate maximum frequency percentage to normalize chart height
    let maxCount = 1;
    for (let i = 0; i < 26; i++) {
      if (plainFreq[i] > maxCount) maxCount = plainFreq[i];
      if (cipherFreq[i] > maxCount) maxCount = cipherFreq[i];
    }
    
    let html = "";
    for (let i = 0; i < 26; i++) {
      // Scale heights between 1% and 100%
      let heightP = cleanPlain.length > 0 ? (plainFreq[i] / maxCount) * 100 : 0;
      let heightC = cleanCipher.length > 0 ? (cipherFreq[i] / maxCount) * 100 : 0;
      
      // Minimum visual heights for visibility of small counts
      if (plainFreq[i] > 0 && heightP < 4) heightP = 4;
      if (cipherFreq[i] > 0 && heightC < 4) heightC = 4;
      
      html += `
        <div class="freq-bar-group">
          <div class="freq-double-bars">
            <div class="f-bar plain-bar" style="height: ${heightP}%" title="Plaintext ${alphabet[i]}: ${plainFreq[i]} counts"></div>
            <div class="f-bar cipher-bar" style="height: ${heightC}%" title="Ciphertext ${alphabet[i]}: ${cipherFreq[i]} counts"></div>
          </div>
          <span class="freq-char-label">${alphabet[i]}</span>
        </div>
      `;
    }
    
    el.freqBarsViewport.innerHTML = html;
  }

  // --- TERMINAL DIAGNOSTICS LOGGER ---
  function logTerminal(level, message) {
    const timestamp = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = 'log-line';
    
    let levelTag = `<span class="log-tag info">[INFO]</span>`;
    if (level === 'SUCCESS') levelTag = `<span class="log-tag success">[SUCCESS]</span>`;
    if (level === 'WARN') levelTag = `<span class="log-tag warn">[WARN]</span>`;
    if (level === 'ERROR') levelTag = `<span class="log-tag error">[ERROR]</span>`;
    
    line.innerHTML = `<span class="log-time">${timestamp}</span> ${levelTag} ${message}`;
    el.terminalLogs.appendChild(line);
    
    // Autoscroll terminal viewport
    el.terminalLogs.scrollTop = el.terminalLogs.scrollHeight;
  }

  // --- BADGE REWARDS VERIFICATION LOOP ---
  function checkBadgeUnlockProgress() {
    if (state.badgeUnlocked) return;
    
    // Check constraints:
    // 1. Plaintext input length is at least 8 (meaningful text).
    // 2. Encryption has run successfully (ciphertext is generated).
    // 3. Ciphertext copied to clipboard (milestone of processing/transferring data).
    // 4. Data integrity is PASS (de-obfuscated matching original text perfectly).
    
    const lengthValid = state.plaintext.length >= 8;
    
    if (lengthValid && state.hasCopied && state.integrityVerified) {
      unlockBadgeMilestone();
    } else {
      // Update badge unlock description helper in configuration sidebar
      if (!lengthValid) {
        el.badgeProgressText.textContent = "Write secret message (min 8 chars)";
      } else if (!state.hasCopied) {
        el.badgeProgressText.textContent = "Copy ciphertext to clipboard";
      } else if (!state.integrityVerified) {
        el.badgeProgressText.textContent = "Verify integrity mismatch";
      }
    }
  }

  function unlockBadgeMilestone() {
    state.badgeUnlocked = true;
    
    // Update badge status icon in panel-config
    el.badgeLockIcon.className = "badge-icon-small shield-unlocked";
    el.badgeProgressText.innerHTML = "<span style='color: var(--clr-green); font-weight: 700;'>MILESTONE COMPLETED!</span>";
    
    logTerminal('SUCCESS', 'VERIFICATION LOOP COMPLETE: Plaintext successfully encrypted, transmitted, and decrypted.');
    logTerminal('SUCCESS', 'UNLOCKED: Data Confidentiality Internship Badge - Project 2 certified.');
    
    // Trigger pop-up modal
    setTimeout(() => {
      el.badgeModal.classList.add('active');
    }, 800);
  }

});
