/**
 * 3C Campus Care & Connect - Application Logic & Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Digital Twin Canvas
  const inspector = document.getElementById('dt-building-inspector');
  const inspName = document.getElementById('insp-name');
  const inspEta = document.getElementById('insp-eta');
  const inspDesc = document.getElementById('insp-desc');
  const inspContact = document.getElementById('insp-contact');
  const inspCloseBtn = document.getElementById('insp-close-btn');
  const inspPrimaryAction = document.getElementById('insp-action-primary');
  const inspDirections = document.getElementById('insp-action-directions');

  let digitalTwin = null;
  if (window.CampusDigitalTwin) {
    digitalTwin = new window.CampusDigitalTwin('campus-canvas', {
      onSelect: (building) => {
        if (!building) {
          inspector.classList.add('hidden');
          return;
        }
        inspName.textContent = building.name;
        inspEta.textContent = building.response;
        inspDesc.textContent = building.desc;
        inspContact.textContent = building.contact;
        inspector.classList.remove('hidden');

        // Set action to reach out discreetly to this specific unit
        inspPrimaryAction.onclick = () => {
          openSupportChatWithContext(`Hello, I'd like confidential guidance regarding ${building.name} services.`);
        };

        inspDirections.onclick = () => {
          alert(`Interactive Navigation to ${building.name}:\nLocation: ${building.contact}\nShortest walking route mapped. Follow the green illuminated pathway.`);
        };
      }
    });
  }

  if (inspCloseBtn) {
    inspCloseBtn.addEventListener('click', () => {
      inspector.classList.add('hidden');
      if (digitalTwin) digitalTwin.selectedBuilding = null;
    });
  }

  // 2. Layer Filter Buttons
  const filterPills = document.querySelectorAll('#dt-layer-filters .filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const layer = pill.dataset.layer;
      if (digitalTwin) {
        digitalTwin.setFilter(layer);
      }
    });
  });

  // 3. Private Mode / Stealth Camouflage Toggle
  const btnPrivate = document.getElementById('btn-toggle-private');
  const privateStatusText = document.getElementById('private-status-text');
  let isStealth = false;

  if (btnPrivate) {
    btnPrivate.addEventListener('click', () => {
      isStealth = !isStealth;
      document.body.classList.toggle('stealth-mode', isStealth);
      btnPrivate.classList.toggle('active', isStealth);
      privateStatusText.textContent = isStealth ? 'Stealth ON' : 'Private';
    });
  }

  // 4. Modal System Helpers
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      closeModal(modal);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // 5. SOS Triggers & Emergency Suite
  const headerSos = document.getElementById('btn-header-sos');
  const floatingSos = document.getElementById('btn-floating-sos');
  const modalSos = document.getElementById('modal-sos');

  if (headerSos) headerSos.addEventListener('click', () => openModal('modal-sos'));
  if (floatingSos) floatingSos.addEventListener('click', () => openModal('modal-sos'));

  // Quick Escape (ESC Key or Button)
  const btnQuickEscape = document.getElementById('btn-quick-escape');
  function executeQuickEscape() {
    window.location.replace('https://en.wikipedia.org/wiki/Portal:Current_events');
  }

  if (btnQuickEscape) btnQuickEscape.addEventListener('click', executeQuickEscape);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        closeModal(activeModal);
      } else {
        // Quick Escape shortcut if pressed on main screen
        executeQuickEscape();
      }
    }
  });

  // Silent Security Dispatch
  const btnDispatch = document.getElementById('btn-dispatch-security');
  if (btnDispatch) {
    btnDispatch.addEventListener('click', () => {
      btnDispatch.textContent = 'Dispatched! Patrol Squad Alpha in transit (ETA 75s)';
      btnDispatch.style.background = '#059669';
      setTimeout(() => {
        alert('Emergency Response Activated:\n\n• Live zone locator locked.\n• 2 Trained safety wardens dispatched to your approximate quadrangle.\n• Stay in well-lit area if possible, or head to Safe Space Sanctuary.');
        closeModal(modalSos);
        btnDispatch.textContent = 'Silent Campus Security Dispatch';
        btnDispatch.style.background = '';
      }, 1000);
    });
  }

  // Call Ambulance
  const btnAmbulance = document.getElementById('btn-call-ambulance');
  if (btnAmbulance) {
    btnAmbulance.addEventListener('click', () => {
      alert('Connecting to 24/7 Campus Trauma Unit...\nHotline: Ext. 911 / Direct: +91 98765 43210');
      window.location.href = 'tel:911';
    });
  }

  // Fake Phone Call Simulator
  const btnFakeCall = document.getElementById('btn-trigger-fake-call');
  const fakeCallScreen = document.getElementById('fake-call-screen');
  const btnCallDecline = document.getElementById('btn-call-decline');
  const btnCallAccept = document.getElementById('btn-call-accept');
  let audioContext = null;
  let ringtoneInterval = null;

  function playRingtoneBeep() {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, audioContext.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.35);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  if (btnFakeCall) {
    btnFakeCall.addEventListener('click', () => {
      closeModal(modalSos);
      fakeCallScreen.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Start ringing sound
      playRingtoneBeep();
      ringtoneInterval = setInterval(playRingtoneBeep, 2000);
    });
  }

  function stopFakeCall() {
    fakeCallScreen.classList.remove('active');
    document.body.style.overflow = '';
    if (ringtoneInterval) {
      clearInterval(ringtoneInterval);
      ringtoneInterval = null;
    }
  }

  if (btnCallDecline) btnCallDecline.addEventListener('click', stopFakeCall);
  if (btnCallAccept) {
    btnCallAccept.addEventListener('click', () => {
      if (ringtoneInterval) clearInterval(ringtoneInterval);
      const callerSub = document.querySelector('.caller-subtitle');
      if (callerSub) callerSub.textContent = 'Call Connected • 00:01';
      setTimeout(() => {
        stopFakeCall();
        if (callerSub) callerSub.textContent = 'Mobile • Incoming Call...';
      }, 4000);
    });
  }

  // 6. 01 — Protected Space Doors
  const doorSupport = document.getElementById('door-support');
  const doorReport = document.getElementById('door-report');
  const doorUnsure = document.getElementById('door-unsure');

  if (doorSupport) doorSupport.addEventListener('click', () => openModal('modal-support-chat'));
  if (doorReport) doorReport.addEventListener('click', () => openModal('modal-report-wizard'));
  if (doorUnsure) doorUnsure.addEventListener('click', () => openModal('modal-unsure-guide'));

  // 7. Confidential Support Live Chat Simulator
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages-container');

  function appendChatMessage(text, sender = 'user') {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  const automatedResponses = [
    "Thank you for sharing that with me. Please know that whatever you are feeling is completely valid, and you are not in trouble.",
    "Take a slow breath. We can take this one step at a time. What would feel most helpful for you right now?",
    "Everything you tell me stays strictly confidential between us. Do you want to talk through some gentle options or just vent?",
    "I am right here with you. Your safety and peace of mind come first.",
    "If you want, we can also connect you with our female peer advocate or an anonymous counsellor."
  ];
  let responseIdx = 0;

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput.value.trim();
      if (!val) return;
      appendChatMessage(val, 'user');
      chatInput.value = '';

      setTimeout(() => {
        const reply = automatedResponses[responseIdx % automatedResponses.length];
        responseIdx++;
        appendChatMessage(reply, 'bot');
      }, 800);
    });
  }

  window.sendQuickChatMessage = function(text) {
    appendChatMessage(text, 'user');
    setTimeout(() => {
      const reply = automatedResponses[responseIdx % automatedResponses.length];
      responseIdx++;
      appendChatMessage(reply, 'bot');
    }, 700);
  };

  window.openChatFromGuide = function(initialQuery) {
    closeModal(document.getElementById('modal-unsure-guide'));
    openModal('modal-support-chat');
    sendQuickChatMessage(initialQuery);
  };

  function openSupportChatWithContext(contextText) {
    openModal('modal-support-chat');
    sendQuickChatMessage(contextText);
  }

  // 8. Incident Report Intake
  const reportForm = document.getElementById('report-intake-form');
  if (reportForm) {
    reportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const randomCode = '3C-INC-' + Math.floor(10000 + Math.random() * 90000);
      alert(`Report Submitted Privately & Securely!\n\nConfidential Tracking Code: ${randomCode}\n\n• Zero personal identifier was captured.\n• You can use this code at any time to add notes or review action steps.\n• No action will be forced without your express consent.`);
      reportForm.reset();
      closeModal(document.getElementById('modal-report-wizard'));
    });
  }

  // 9. 07 — Counselling Slot Booking
  const slotNodes = document.querySelectorAll('.slot-node');
  const bookingSlotText = document.getElementById('booking-slot-text');
  const btnConfirmSlot = document.getElementById('btn-confirm-slot');
  const bookingSummary = document.getElementById('booking-modal-summary');
  const bookingPasskey = document.getElementById('booking-passkey');
  let selectedSlotTime = '11:00';

  slotNodes.forEach(node => {
    node.addEventListener('click', () => {
      slotNodes.forEach(s => s.classList.remove('active'));
      node.classList.add('active');
      selectedSlotTime = node.dataset.time;
      if (bookingSlotText) {
        bookingSlotText.textContent = `Selected Slot: Today at ${selectedSlotTime}`;
      }
    });
  });

  if (btnConfirmSlot) {
    btnConfirmSlot.addEventListener('click', () => {
      const pass = '3C-QH-' + Math.floor(1000 + Math.random() * 9000);
      if (bookingSummary) {
        bookingSummary.textContent = `Your confidential quiet session for Today at ${selectedSlotTime} has been secured.`;
      }
      if (bookingPasskey) {
        bookingPasskey.textContent = pass;
      }
      openModal('modal-booking-confirm');
    });
  }
});
