/* =============================================================
   couder.js — Couder profile + intervention history + AI analysis
   FIXED: form fields, AI method name, data unwrapping, TTS AUDIO
   ============================================================= */

const CouderView = (() => {
    let _couder = null;
    let _interventions = [];
    let _aiAnalyses = [];
    let _ttsPlaying = null;
    let _showAllAIAnalyses = false;
    let _selectedAIAnalysisIndex = 0;
    let _ttsService = null;

    const INTERVENTION_TYPES = [
        { id: 1, label: 'Initial Evaluation' },
        { id: 2, label: 'Follow-up' },
        { id: 3, label: 'Risk Assessment' },
        { id: 4, label: 'Closing' },
        { id: 5, label: 'Other' },
    ];

    async function render(params) {
        const app = document.getElementById('app');
        if (!app) return;
        const { id, cc } = params;
        app.innerHTML = _shellHtml();
        
        // Initialize TTS Service
        if (window.TTSService) {
            _ttsService = new TTSService();
        }
        
        try {
            console.log('CouderView.render called with params:', params);
            _couder = cc
                ? await Api.get('/couders/search?cc=' + encodeURIComponent(cc))
                : await Api.get('/couders/' + id);
            
            console.log('Raw couder data received:', _couder);
            
            // Apply data mapping for consistency
            _couder = TranslationHelper.mapBackendToFrontend(_couder);
            console.log('Mapped couder data:', _couder);

            const [intData, aiList] = await Promise.all([
                Api.get('/couders/' + _couder.id + '/interventions'),
                Api.get('/couders/' + _couder.id + '/ai-analysis').catch(() => []),
            ]);

            console.log('Raw interventions data:', intData);
            console.log('Raw AI analyses data:', aiList);
            
            // Apply data mapping for consistency
            const mappedInterventions = TranslationHelper.mapArray(
                Array.isArray(intData) ? intData
                : (intData && intData.interventions) ? intData.interventions
                : []
            );
            const mappedAIAnalyses = TranslationHelper.mapArray(Array.isArray(aiList) ? aiList : []);
            
            console.log('Mapped interventions:', mappedInterventions);
            console.log('Mapped AI analyses:', mappedAIAnalyses);
            
            _interventions = mappedInterventions;
            _aiAnalyses = mappedAIAnalyses;
            _renderContent();
        } catch (err) {
            console.error('CouderView error:', err);
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                params: params,
                couderId: _couder?.id,
                couderName: _couder?.full_name
            });
            
            // Try to get more specific error information
            if (err.response) {
                console.error('API Response Error:', {
                    status: err.response.status,
                    statusText: err.response.statusText,
                    data: err.response.data
                });
            }
            
            const content = document.getElementById('couder-content');
            if (content) {
                content.innerHTML = _errorHtml(err.message);
            }
        }
    }

    function _renderContent() {
        console.log('_renderContent called, _couder:', _couder);
        if (!_couder) {
            console.error('No couder data available in _renderContent');
            const content = document.getElementById('couder-content');
            if (content) {
                content.innerHTML = _errorHtml('No couder data available');
            }
            return;
        }
        const content = document.getElementById('couder-content');
        if (!content) {
            console.error('couder-content element not found');
            return;
        }

        console.log('Rendering couder with data:', {
            full_name: _couder.full_name,
            national_id: _couder.national_id,
            status: _couder.status,
            interventions_count: _interventions.length,
            ai_analyses_count: _aiAnalyses.length
        });

        const statusMap = { active: ['green','Active'], completed: ['blue','Completed'], withdrawn: ['red','Withdrawn'] };
        const [sc, st] = statusMap[_couder.status] || ['gray', _couder.status];

        content.innerHTML =
            /* Profile */
            '<div class="bg-gray-800/60 rounded-xl p-8 border border-gray-700/50 mb-8">' +
              '<div class="flex flex-wrap items-center justify-between gap-4 mb-6">' +
                '<div class="flex items-center gap-5">' +
                  '<div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">' +
                    '<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>' +
                  '</div>' +
                  '<div>' +
                    '<h1 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">' + _esc(_couder.full_name) + '</h1>' +
                    '<p class="text-gray-400 mt-1">CC: ' + _esc(_couder.national_id) + '</p>' +
                  '</div>' +
                '</div>' +
                '<span class="bg-' + sc + '-600/80 px-4 py-2 rounded-lg text-white font-medium">' + st + '</span>' +
              '</div>' +
              '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">' +
                _cell('Sede', _couder.sede_name) +
                _cell('Cohort', _couder.cohort_name) +
                _cell('Clan', _couder.clan_name) +
                _cell('Route', _couder.route_name === 'avanzada' ? 'Advanced' : 'Basic') +
                _cell('Team Leader', _couder.tl_name) +
                _cell('Shift', _couder.clan_shift === 'morning' ? 'Morning' : 'Afternoon') +
                _cell('Score', _couder.average_score || '—') +
                _cell('Email', _couder.email || '—') +
              '</div>' +
            '</div>' +

            /* Add intervention form */
            '<div class="bg-gray-800/60 rounded-xl p-8 border border-gray-700/50 mb-8">' +
              '<h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">' +
                '<div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">' +
                  '<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>' +
                '</div>New Intervention</h3>' +
              '<div class="space-y-4">' +
                '<label class="block text-gray-300 mb-2 text-sm font-medium">Type of Intervention *</label>' +
                '<select id="int-type" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none">' +
                '<option value="">Select a type</option>' +
                INTERVENTION_TYPES.map(t => '<option value="' + t.id + '">' + t.label + '</option>').join('') +
                '</select></div>' +
                '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
                  '<div><label class="block text-gray-300 mb-2 text-sm font-medium">Date *</label>' +
                  '<input type="date" id="int-date" value="' + new Date().toISOString().slice(0,10) + '" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"/></div>' +
                  '<div><label class="block text-gray-300 mb-2 text-sm font-medium">Time *</label>' +
                  '<input type="time" id="int-time" value="' + new Date().toISOString().slice(11,16) + '" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"/></div>' +
                '</div>' +
                '<div><label class="block text-gray-300 mb-2 text-sm font-medium">Notes *</label>' +
                '<textarea id="int-notes" rows="4" placeholder="Describe the intervention performed..." class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"></textarea></div>' +
                '<div id="int-error" class="hidden text-red-400 text-sm p-3 bg-red-900/20 rounded-lg border border-red-500/30"></div>' +
                '<button id="btn-save-intervention" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all hover:scale-105 transform flex items-center gap-2">' +
                  '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' +
                  'Save Intervention</button>' +
              '</div></div>' +

            /* AI Analysis */
            '<div class="bg-gray-800/60 rounded-xl p-8 border border-gray-700/50 mb-8">' +
              '<div class="flex items-center justify-between mb-6">' +
                '<h3 class="text-xl font-bold text-white flex items-center gap-3">' +
                  '<div class="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>' +
                  'AI Analysis <span class="bg-pink-600/20 text-pink-400 px-3 py-1 rounded-full text-sm font-normal ml-2">' + _aiAnalyses.length + ' saved</span>' +
                '</h3>' +
                '<button id="btn-generate-ai" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-5 py-2.5 rounded-lg transition-all hover:scale-105 text-white font-medium flex items-center gap-2">' +
                  '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Generate Analysis</button>' +
              '</div>' +
              (_aiAnalyses.length === 0
                ? '<p class="text-gray-500 text-center py-6">No analysis has been generated yet. Generate one using the button above.</p>'
                : _renderAIAnalysesSection()) +
            '</div>' +

            /* Intervention history */
            '<div class="bg-gray-800/60 rounded-xl p-8 border border-gray-700/50 mb-8">' +
              '<h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">' +
                '<div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>' +
                'History of Interventions <span class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-normal ml-2">' + _interventions.length + '</span>' +
              '</h3>' +
              (_interventions.length === 0
                ? '<p class="text-gray-500 text-center py-6">No interventions registered yet.</p>'
                : '<div class="max-h-96 overflow-y-auto pr-2 space-y-4 custom-scrollbar">' + _interventions.map(_ivCard).join('') + '</div>') +
            '</div>';

        const backBtn = document.getElementById('back-btn');
        if (backBtn) backBtn.onclick = () => Router.navigate('clan', { id: _couder.clan_id });
        
        // Setup event listeners for buttons
        _setupEventListeners();
    }

    function _setupEventListeners() {
        // Save intervention button
        const saveBtn = document.getElementById('btn-save-intervention');
        if (saveBtn) {
            saveBtn.addEventListener('click', _submitIntervention);
        }
        
        // Generate AI button
        const aiBtn = document.getElementById('btn-generate-ai');
        if (aiBtn) {
            aiBtn.addEventListener('click', _generateAIAnalysis);
        }
        
        // AI Analysis buttons
        const showAllAiBtn = document.getElementById('btn-show-all-ai');
        if (showAllAiBtn) {
            showAllAiBtn.addEventListener('click', _toggleShowAllAIAnalyses);
        }
        
        const hiofailureiBtn = document.getElementById('btn-hiof-all-ai');
        if (hiofailureiBtn) {
            hiofailureiBtn.addEventListener('click', _toggleShowAllAIAnalyses);
        }
        
        const aiDateSelector = document.getElementById('ai-date-selector');
        if (aiDateSelector) {
            aiDateSelector.addEventListener('change', (e) => _selectAIAnalysis(e.target.value));
        }
        
        // TTS buttons for AI cards
        _aiAnalyses.forEach((a, idx) => {
            const ttsBtn = document.getElementById('tts-btn-' + idx);
            if (ttsBtn) {
                const ttsText = 'Summary: ' + (a.summary || '') + '. Diagnosis: ' + (a.diagnosis || '') + '. Suggestions: ' + (Array.isArray(a.suggestions) ? a.suggestions.join('. ') : (a.suggestions || ''));
                const safeText = ttsText.replace(/'/g, '').replace(/"/g, '').replace(/\n/g, '. ');
                ttsBtn.addEventListener('click', () => _toggleTTS(idx, safeText));
            }
        });
        
        // Refresh button
        const refreshBtn = document.querySelector('[onclick="CouderView._refreshData()"]');
        if (refreshBtn) {
            refreshBtn.removeAttribute('onclick');
            refreshBtn.addEventListener('click', _refreshData);
        }
        
        // Navigation buttons in navbar
        const navButtons = document.querySelectorAll('nav button[onclick]');
        navButtons.forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            if (onclick.includes('Router.navigate')) {
                btn.removeAttribute('onclick');
                if (onclick.includes('dashboard')) {
                    btn.addEventListener('click', () => window.location.hash = '#dashboard');
                } else if (onclick.includes('search')) {
                    btn.addEventListener('click', () => window.location.hash = '#search');
                }
            } else if (onclick.includes('Auth.logout')) {
                btn.removeAttribute('onclick');
                btn.addEventListener('click', () => {
                    if (window.Auth && window.Auth.logout) {
                        window.Auth.logout();
                    }
                    window.location.hash = '#login';
                });
            }
        });
        
        // Logo click
        const logo = document.querySelector('nav div[onclick="Router.navigate(\'dashboard\')"]');
        if (logo) {
            logo.removeAttribute('onclick');
            logo.addEventListener('click', () => window.location.hash = '#dashboard');
        }
    }

    function _cell(label, val) {
        return '<div class="bg-gray-700/50 rounded-lg p-4 text-center"><p class="text-gray-400 text-xs mb-1">' + _esc(label) + '</p><p class="text-white font-semibold truncate">' + _esc(String(val || '—')) + '</p></div>';
    }

    function _ivCard(iv) {
        const date = iv.session_date ? new Date(iv.session_date).toLocaleDateString('en-US') : '—';
        const time = iv.session_time ? String(iv.session_time).slice(0,5) : '—';
        return '<div class="bg-gray-700/40 rounded-lg p-5 border border-gray-600/40">' +
            '<div class="flex flex-wrap items-center justify-between gap-2 mb-3">' +
              '<div class="flex items-center gap-3">' +
                '<span class="bg-blue-600/30 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">' + _esc(iv.intervention_type || '—') + '</span>' +
                '<span class="text-gray-400 text-sm">' + date + ' · ' + time + '</span>' +
              '</div>' +
              '<span class="text-gray-400 text-sm flex items-center gap-1">' +
                '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>' +
                _esc(iv.added_by || '—') + '</span>' +
            '</div>' +
            '<p class="text-gray-200 leading-relaxed whitespace-pre-wrap">' + _esc(iv.notes || '—') + '</p>' +
        '</div>';
    }

    function _aiCard(a, idx) {
        const date = a.createdAt ? new Date(a.createdAt).toLocaleString('en-US') : '—';
        const sugg = Array.isArray(a.suggestions) ? a.suggestions.join('. ') : (a.suggestions || '—');
        const ttsText = 'Summary: ' + (a.summary || '') + '. Diagnosis: ' + (a.diagnosis || '') + '. Suggestions: ' + sugg;
        const safeText = ttsText.replace(/'/g, '').replace(/"/g, '').replace(/\n/g, '. ');
        return '<div class="bg-gray-700/40 rounded-xl p-6 border border-gray-600/40 mb-4" id="ai-' + idx + '">' +
            '<div class="flex flex-wrap items-center justify-between gap-3 mb-5">' +
              '<p class="text-white font-semibold">Analysis from ' + _esc(date) + '</p>' +
              '<button id="tts-btn-' + idx + '" class="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg text-sm text-white transition-all">' +
                '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M6.343 6.343a8 8 0 000 11.314"/></svg>' +
                '<span>Listen</span>' +
              '</button>' +
            '</div>' +
            '<div class="space-y-4">' +
              '<div class="bg-gray-800/60 rounded-lg p-4"><p class="text-purple-400 text-xs font-semibold uppercase tracking-wide mb-2">Summary</p><p class="text-gray-200 leading-relaxed">' + _esc(a.summary || '—') + '</p></div>' +
              '<div class="bg-gray-800/60 rounded-lg p-4"><p class="text-pink-400 text-xs font-semibold uppercase tracking-wide mb-2">Diagnosis</p><p class="text-gray-200 leading-relaxed">' + _esc(a.diagnosis || '—') + '</p></div>' +
              '<div class="bg-gray-800/60 rounded-lg p-4"><p class="text-blue-400 text-xs font-semibold uppercase tracking-wide mb-2">Suggestions</p><p class="text-gray-200 leading-relaxed whitespace-pre-wrap">' + _esc(sugg) + '</p></div>' +
            '</div>' +
        '</div>';
    }

    function _renderAIAnalysesSection() {
        if (_aiAnalyses.length === 0) return '';
        
        // Show only the selected analysis (by default the most recent, index 0)
        const selectedAnalysis = _aiAnalyses[_selectedAIAnalysisIndex];
        const date = selectedAnalysis.createdAt ? new Date(selectedAnalysis.createdAt).toLocaleString('en-US') : '—';
        
        let html = '<div class="space-y-4">';
        
        // Show the selected analysis
        html += _aiCard(selectedAnalysis, _selectedAIAnalysisIndex);
        
        // If there is more than one analysis, show button to access previous ones
        if (_aiAnalyses.length > 1) {
            if (!_showAllAIAnalyses) {
                // button to show selector of previous analyses
                html += '<div class="text-center mt-4">' +
                    '<button id="btn-show-all-ai" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 mx-auto">' +
                      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
                      'Access Previous Analyses' +
                    '</button>' +
                '</div>';
            } else {
                // Date selector to choose analysis
                html += '<div class="bg-gray-700/50 rounded-lg p-4 mt-4">' +
                    '<label class="block text-gray-300 mb-2 text-sm font-medium">Select Analysis by Date:</label>' +
                    '<select id="ai-date-selector" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-pink-500 focus:outline-none">' +
                        _aiAnalyses.map((a, idx) => {
                            const d = a.createdAt ? new Date(a.createdAt).toLocaleString('en-US') : '—';
                            const isSelected = idx === _selectedAIAnalysisIndex;
                            return '<option value="' + idx + '"' + (isSelected ? ' selected' : '') + '>Analysis from ' + d + '</option>';
                        }).join('') +
                    '</select>' +
                    '<button id="btn-hide-all-ai" class="mt-3 bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded-lg transition-all text-sm flex items-center gap-2">' +
                      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' +
                      'Hide selector' +
                    '</button>' +
                '</div>';
            }
        }
        
        html += '</div>';
        return html;
    }

    function _toggleShowAllAIAnalyses() {
        _showAllAIAnalyses = !_showAllAIAnalyses;
        _renderContent();
    }

    async function _selectAIAnalysis(idx) {
        _selectedAIAnalysisIndex = parseInt(idx);
        
        // Obtener el análiiss seleccionado y sus Dates
        const selectedAnalysis = _aiAnalyses[_selectedAIAnalysisIndex];
        
        try {
            // Show indicador of carga
            const selector = document.getElementById('ai-date-selector');
            if (selector) {
                selector.disabled = true;
                selector.style.opacity = '0.6';
            }
            
            // is el análiiss tiene un período específico, usar esas Dates
            let requestBody = {};
            
            if (selectedAnalysis && selectedAnalysis.periodLabel && selectedAnalysis.periodLabel !== 'all') {
                // Extraer Dates del periodLabel (format: "YYYY-MM-DD to YYYY-MM-DD" o "YYYY-MM-DD")
                const dateRange = selectedAnalysis.periodLabel;
                let fromDate, toDate;
                
                if (dateRange.includes(' to ')) {
                    [fromDate, toDate] = dateRange.split(' to ');
                } else if (dateRange.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    fromDate = toDate = dateRange;
                }
                
                if (fromDate && toDate) {
                    requestBody = {
                        from: fromDate,
                        to: toDate,
                        periodLabel: selectedAnalysis.periodLabel
                    };
                }
            }
            
            // Generate New análiiss con el filter of Dates específico
            const analysis = await Api.post('/couders/' + _couder.id + '/ai-analysis', requestBody);
            
            // Update el análiiss seleccionado con el New análiiss generado
            _aiAnalyses[_selectedAIAnalysisIndex] = analysis;
            
            Toast.show('Analysis updated for selected period', 'success');
        } catch (err) {
            console.error('Error generating analysis:', err);
            Toast.show('Error updating analysis: ' + err.message, 'error');
        } finally {
            // Restaurar selector
            const selector = document.getElementById('ai-date-selector');
            if (selector) {
                selector.disabled = false;
                selector.style.opacity = '1';
            }
        }
        
        _renderContent();
    }

    async function _submitIntervention() {
        const typeId = document.getElementById('int-type')?.value;
        const date   = document.getElementById('int-date')?.value;
        const time   = document.getElementById('int-time')?.value;
        const notes  = document.getElementById('int-notes')?.value?.trim();
        const errEl  = document.getElementById('int-error');

        const showErr = (m) => { if (errEl) { errEl.textContent = m; errEl.classList.remove('hidden'); } };
        const hideErr = () => { if (errEl) errEl.classList.add('hidden'); };
        hideErr();

        if (!typeId) return showErr('Select the type of Intervention.');
        if (!date)   return showErr('Date is required.');
        if (!time)   return showErr('Time is required.');
        if (!notes)  return showErr('Notes cannot be empty.');

        const btn = document.getElementById('btn-save-intervention');
        const orig = btn?.innerHTML;
        if (btn) { btn.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...'; btn.disabled = true; }

        try {
            const created = await Api.post('/couders/' + _couder.id + '/interventions', {
                interventionTypeId: parseInt(typeId),
                notes, sessionDate: date, sessionTime: time,
            });
            _interventions.unshift(created);
            _renderContent();
            Toast.show('Intervention saved successfully', 'success');
        } catch (err) {
            showErr('Error saving: ' + err.message);
            if (btn) { btn.innerHTML = orig; btn.disabled = false; }
        }
    }

    async function _generateAIAnalysis() {
        console.log('_generateAIAnalysis called for couder:', _couder?.full_name || 'Unknown');
        console.log('Available interventions:', _interventions.length);
        console.log('Available AI analyses:', _aiAnalyses.length);
        
        if (_interventions.length === 0) {
            console.log('No interventions found, cannot generate AI analysis');
            Toast.show('This couder has no registered interventions yet.', 'error');
            return;
        }
        
        const btn = document.getElementById('btn-generate-ai');
        const orig = btn?.innerHTML;
        if (btn) { btn.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating...'; btn.disabled = true; }
        
        try {
            console.log('Making AI analysis request for couder ID:', _couder.id);
            console.log('Request payload: {}');
            
            const analysis = await Api.post('/couders/' + _couder.id + '/ai-analysis', {});
            console.log('AI analysis response:', analysis);
            
            _aiAnalyses.unshift(analysis);
            console.log('AI analyses after adding:', _aiAnalyses.length);
            
            _renderContent();
            Toast.show('Analysis generated and saved', 'success');
        } catch (err) {
            console.error('Error in _generateAIAnalysis:', err);
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                couderId: _couder?.id,
                couderName: _couder?.full_name,
                interventionsCount: _interventions.length
            });
            Toast.show('Error generating analysis: ' + err.message, 'error');
            if (btn) { btn.innerHTML = orig; btn.disabled = false; }
        }
    }

    function _toggleTTS(idx, text) {
        const btn = document.getElementById('tts-btn-' + idx);
        
        if (!_ttsService) {
            Toast.show('Text-to-speech service not available.', 'error');
            return;
        }
        
        // is currently playing this same AUDIO, stop it
        if (_ttsPlaying === idx) {
            _ttsService.cancel();
            _ttsPlaying = null;
            if (btn) {
                btn.querySelector('span').textContent = 'Listen';
                btn.classList.remove('bg-red-600', 'hover:bg-red-700');
                btn.classList.add('bg-gray-600', 'hover:bg-gray-500');
            }
            return;
        }
        
        // Stop any other playing AUDIO
        if (_ttsPlaying !== null) {
            const prevBtn = document.getElementById('tts-btn-' + _ttsPlaying);
            if (prevBtn) {
                prevBtn.querySelector('span').textContent = 'Listen';
                prevBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
                prevBtn.classList.add('bg-gray-600', 'hover:bg-gray-500');
            }
        }
        
        // Update button state
        _ttsPlaying = idx;
        if (btn) {
            btn.querySelector('span').textContent = 'Stop';
            btn.classList.add('bg-red-600', 'hover:bg-red-700');
            btn.classList.remove('bg-gray-600', 'hover:bg-gray-500');
        }
        
        // Configure TTS options for better English
        const ttsOptions = {
            rate: 0.9,        // Slightly slower for clarity
            pitch: 1.0,       // Normal pitch
            volume: 1.0,      // Full volume
            onStart: () => {
                console.log('TTS: Started playing analysis');
            },
            onEnd: () => {
                _ttsPlaying = null;
                if (btn) {
                    btn.querySelector('span').textContent = 'Listen';
                    btn.classList.remove('bg-network-600', 'hover:bg-network-700');
                    btn.classList.add('bg-gray-600', 'hover:bg-gray-500');
                }
            },
            onerror: (error) => {
                console.error('TTS error:', error);
                _ttsPlaying = null;
                if (btn) {
                    btn.querySelector('span').textContent = 'Listen';
                    btn.classList.remove('bg-network-600', 'hover:bg-network-700');
                    btn.classList.add('bg-gray-600', 'hover:bg-gray-500');
                }
                Toast.show('Speech synthesis failed. Please try again.', 'error');
            }
        };
        
        // Speak the text
        _ttsService.speak(text, ttsOptions).catch(error => {
            console.error('TTS Speak error:', error);
            Toast.show('Failed to start speech synthesis.', 'error');
        });
    }

    async function _refreshData() {
        if (!_couder) return;
        try {
            console.log('Refreshing couder data...');
            const [intData, aiList] = await Promise.all([
                Api.get('/couders/' + _couder.id + '/interventions'),
                Api.get('/couders/' + _couder.id + '/ai-analysis').catch(() => []),
            ]);
            console.log('Raw refresh data - interventions:', intData);
            console.log('Raw refresh data - AI analyses:', aiList);
            
            // Apply data mapping for consistency
            const mappedInterventions = TranslationHelper.mapArray(
                Array.isArray(intData) ? intData : (intData?.interventions || [])
            );
            const mappedAIAnalyses = TranslationHelper.mapArray(Array.isArray(aiList) ? aiList : []);
            console.log('Mapped refresh interventions:', mappedInterventions);
            console.log('Mapped refresh AI analyses:', mappedAIAnalyses);
            
            _interventions = mappedInterventions;
            _aiAnalyses = mappedAIAnalyses;
            _renderContent();
            Toast.show('Data updated', 'success');
        } catch (err) {
            console.error('Refresh error:', err);
            Toast.show('Error updating: ' + err.message, 'error');
        }
    }

    function _esc(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function _shellHtml() {
        return '<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">' +
            '<nav class="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4 sticky top-0 z-50">' +
              '<div class="flex items-center justify-between">' +
                '<div class="flex items-center gap-4">' +
                  '<div class="flex items-center gap-3 cursor-pointer" onclick="Router.navigate(\'dashboard\')">' +
                    '<div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><span class="text-white font-bold text-lg">D</span></div>' +
                    '<h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">DataCore</h1>' +
                  '</div>' +
                  '<button onclick="Router.navigate(\'dashboard\')" class="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-all">Dashboard</button>' +
                  '<button onclick="Router.navigate(\'search\')" class="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-all">Search</button>' +
                '</div>' +
                '<button onclick="Auth.logout()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2">' +
                  '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>Logout</button>' +
              '</div>' +
            '</nav>' +
            '<div class="p-6">' +
              '<div class="flex items-center gap-4 mb-6">' +
                '<button id="back-btn" class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2">' +
                  '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>Back to Clan</button>' +
                '<h2 class="text-2xl font-bold text-white">Couder Profile</h2>' +
                '<button onclick="CouderView._refreshData()" class="ml-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">' +
                  '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Update</button>' +
              '</div>' +
              '<div id="couder-content">' +
                '<div class="text-center py-20">' +
                  '<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">' +
                    '<div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>' +
                  '<p class="text-gray-400">Loading couder...</p>' +
              '</div>' +
            '</div>' +
            '</div></div>';
    }

    function _errorHtml(msg) {
        const timestamp = new Date().toISOString();
        return `
            <div class="text-center py-20">
                <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-red-400 mb-3">Error Loading Couder</h2>
                <p class="text-gray-400 mb-6">${_esc(msg)}</p>
                <div class="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
                    <h3 class="text-sm font-semibold text-gray-300 mb-2">Debug Information:</h3>
                    <p class="text-xs text-gray-500 mb-1">Timestamp: ${_esc(timestamp)}</p>
                    <p class="text-xs text-gray-500 mb-1">Error: ${_esc(msg)}</p>
                    <p class="text-xs text-gray-500">Please check the browser console for more details.</p>
                </div>
                <div class="flex gap-4 justify-center">
                    <button onclick="Router.navigate('dashboard')" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-all hover:scale-105 transform">
                        Back to Dashboard
                    </button>
                    <button onclick="location.reload()" class="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-all hover:scale-105 transform">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }

    return { render, _submitIntervention, _generateAIAnalysis, _toggleTTS, _refreshData };
})();

window.CouderView = CouderView;
