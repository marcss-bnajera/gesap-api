// Evaluación primaria — método XABCDE
// Amenazas a corto plazo que afectan la vida del paciente
export interface PrimaryAssessment {
    x_hemorrhage?: string; // Control de hemorragias exanguinantes
    a_airway?: string;     // Vía aérea
    b_breathing?: string;  // Respiración
    c_circulation?: string; // Circulación
    d_disability?: string; // Estado neurológico
    e_exposure?: string;   // Exposición/ambiente
}

// Evaluación secundaria — método SAMPLE
// Signos vitales y datos estandarizados
export interface SecondaryAssessment {
    signs_and_symptoms?: string;
    allergies?: string;
    medications?: string;
    past_medical_history?: string;
    last_oral_intake?: string;
    events?: string;
    vital_signs?: {
        blood_pressure?: string;
        heart_rate?: string;
        respiratory_rate?: string;
        oxygen_saturation?: string;
        temperature?: string;
    };
}

// Registro de cierre — lo llena el ASISTENTE_RECEPCION_CLINICA al cerrar la emergencia
export interface CompletionRecord {
    treatment_applied?: string;
    medications_administered?: string;
    patient_condition_on_arrival?: string;
    patient_condition_on_completion?: string;
    final_notes?: string;
    completed_at?: string; // ISO datetime
}
