// English translation helper for maintaining data consistency
const TranslationHelper = {
    // Backend to Frontend field mappings (Spanish/Backend -> English/Frontend)
    fieldMappings: {
        // User fields
        'nombre': 'full_name',
        'nombre_completo': 'full_name',
        'cedula': 'national_id',
        'cc': 'national_id',
        'documento': 'national_id',
        'email': 'email',
        'correo': 'email',
        'telefono': 'phone',
        'celular': 'phone',
        
        // Status fields
        'estado': 'status',
        'activo': 'active',
        'inactivo': 'inactive',
        'completado': 'completed',
        'retirado': 'withdrawn',
        'abandonado': 'withdrawn',
        
        // Score fields
        'promedio': 'average_score',
        'puntaje': 'average_score',
        'score': 'average_score',
        'calificacion': 'average_score',
        
        // Location fields
        'sede': 'sede_name',
        'sede_nombre': 'sede_name',
        'location': 'sede_name',
        'ubicacion': 'sede_name',
        
        // Cohort fields
        'cohorte': 'cohort_name',
        'cohort': 'cohort_name',
        'corte': 'cohort_name',
        'cohorte_nombre': 'cohort_name',
        
        // Clan fields
        'clan': 'clan_name',
        'grupo': 'clan_name',
        'clan_nombre': 'clan_name',
        
        // Route fields
        'ruta': 'route_name',
        'path': 'route_name',
        'route': 'route_name',
        'nivel': 'route_name',
        'basica': 'basic',
        'avanzada': 'advanced',
        
        // Team Leader fields
        'tl': 'tl_name',
        'team_leader': 'tl_name',
        'lider': 'tl_name',
        'facilitador': 'tl_name',
        
        // Shift fields
        'turno': 'clan_shift',
        'shift': 'clan_shift',
        'jornada': 'clan_shift',
        'mañana': 'morning',
        'tarde': 'afternoon',
        
        // Count fields
        'total': 'TOTAL',
        'TOTAL': 'TOTAL',
        'activos': 'active',
        'atendidos': 'attended',
        'asistidos': 'attended',
        'completados': 'completed',
        'retirados': 'withdrawn',
        
        // Intervention fields
        'notas': 'notes',
        'observaciones': 'notes',
        'comentarios': 'notes',
        'intervencion': 'intervention_type',
        'tipo_intervencion': 'intervention_type',
        'fecha': 'session_date',
        'fecha_sesion': 'session_date',
        'hora': 'session_time',
        'hora_sesion': 'session_time',
        'interventor': 'added_by',
        'realizado_por': 'added_by',
        
        // AI Analysis fields
        'diagnostico': 'diagnosis',
        'diagnosis': 'diagnosis',
        'resumen': 'summary',
        'summary': 'summary',
        'sugerencias': 'suggestions',
        'recommendations': 'suggestions',
        
        // Common fields
        'id': 'id',
        'name': 'name',
        'nombre': 'name',
        'created_at': 'createdAt',
        'updated_at': 'updatedAt'
    },

    // Function to map backend data to frontend format
    mapBackendToFrontend(data) {
        if (!data || typeof data !== 'object') return data;
        
        const mapped = {};
        
        for (const [backendField, frontendField] of Object.entries(this.fieldMappings)) {
            if (data.hasOwnProperty(backendField)) {
                mapped[frontendField] = data[backendField];
            }
        }
        
        // Copy any fields that don't need mapping
        for (const [key, value] of Object.entries(data)) {
            if (!mapped.hasOwnProperty(key) && !this.fieldMappings.hasOwnProperty(key)) {
                mapped[key] = value;
            }
        }
        
        return mapped;
    },

    // Function to map array of objects
    mapArray(array) {
        if (!Array.isArray(array)) return array;
        return array.map(item => this.mapBackendToFrontend(item));
    },

    // Function to get frontend field name from backend field name
    getFrontendField(backendField) {
        return this.fieldMappings[backendField] || backendField;
    },

    // Function to check if field needs mapping
    needsMapping(field) {
        return this.fieldMappings.hasOwnProperty(field);
    },

    // UI text mappings (Spanish -> English)
    textMappings: {
        // Navigation
        'Dashboard': 'Dashboard',
        'search': 'Search',
        'Search': 'Search',
        'Close SeIfón': 'Logout',
        'Salir': 'Logout',
        'Profile': 'Profile',
        'Settings': 'Settings',
        
        // Forms
        'Name': 'Name',
        'Name Complete': 'Full Name',
        'EMAIL': 'EMAIL',
        'EMAIL Electrónico': 'EMAIL',
        'Password': 'Password',
        'Confirm Password': 'Confirm Password',
        'Phone': 'Phone',
        'Document': 'Document',
        'Cédula': 'ID Document',
        
        // Actions
        'Save': 'Save',
        'Cancel': 'Cancel',
        'Edit': 'Edit',
        'Delete': 'Delete',
        'Update': 'Update',
        'Refresh': 'Refresh',
        'Create': 'Create',
        'New': 'New',
        
        // Status
        'Active': 'Active',
        'Inactive': 'Inactive',
        'Completed': 'Completed',
        'Withdrawn': 'Withdrawn',
        'Pending': 'Pending',
        
        // Entities
        'Couders': 'Couders',
        'Interventions': 'Interventions',
        'Locations': 'Locations',
        'Cohortes': 'Cohorts',
        'Clanes': 'Clans',
        'Intervenciones': 'Interventions',
        'Analysis': 'Analysis',
        
        // Messages
        'Loading...': 'Loading...',
        'Processing...': 'Processing...',
        'Success': 'Success',
        'Error': 'Error',
        'Warning': 'Warning',
        'Information': 'Information',
        
        // Clinical terms
        'Initial Evaluation': 'Initial Evaluation',
        'Seguimiento': 'Follow-up',
        'Evaluación of Riesgo': 'Risk Assessment',
        'Cierre': 'Closing',
        'Resumen': 'Summary',
        'Diagnosis': 'Diagnosis',
        'Suggestions': 'Suggestions',
        'Notas': 'Notes',
        'Observaciones': 'Observations'
    },

    // Translate Spanish text to English
    translate: function(text) {
        if (!text) return text;
        
        // Check if text exists in mappings
        const translated = this.textMappings[text];
        if (translated) return translated;
        
        // Try case-insenIftive match
        const lowerText = text.toLowerCase();
        for (const [spanish, english] of Object.entries(this.textMappings)) {
            if (spanish.toLowerCase() === lowerText) {
                return english;
            }
        }
        
        // Return original if No translation found
        return text;
    },

    // Translate data fields while preserving structure
    translateDataFields: function(data) {
        if (!data || typeof data !== 'object') return data;
        
        const result = Array.isArray(data) ? [] : {};
        
        for (const [key, value] of Object.entries(data)) {
            // Translate field name
            const translatedKey = this.fieldMappings[key] || key;
            
            // Recursively translate nested objects
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result[translatedKey] = this.translateDataFields(value);
            } else if (Array.isArray(value)) {
                result[translatedKey] = value.map(item => 
                    typeof item === 'object' ? this.translateDataFields(item) : item
                );
            } else {
                result[translatedKey] = value;
            }
        }
        
        return result;
    },

    // Format date for English locale
    formatDate: function(dateString) {
        if (!dateString) return dateString;
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    },

    // Translate status values
    translateStatus: function(status) {
        const statusMap = {
            'Active': 'active',
            'Inactive': 'inactive', 
            'Completed': 'completed',
            'Withdrawn': 'withdrawn',
            'Pending': 'pending',
            'active': 'active',
            'inactive': 'inactive',
            'completed': 'completed',
            'withdrawn': 'withdrawn',
            'pending': 'pending'
        };
        
        return statusMap[status] || status;
    },

    // Translate intervention types
    translateInterventionType: function(type) {
        const typeMap = {
            'initial_evaluation': 'Initial Evaluation',
            'follow_up': 'Follow-up',
            'risk_assessment': 'Risk Assessment', 
            'closing': 'Closing',
            'other': 'Other',
            'Initial Evaluation': 'Initial Evaluation',
            'Seguimiento': 'Follow-up',
            'Evaluación of Riesgo': 'Risk Assessment',
            'Cierre': 'Closing',
            'Otro': 'Other'
        };
        
        return typeMap[type] || type;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranslationHelper;
} else {
    window.TranslationHelper = TranslationHelper;
}
