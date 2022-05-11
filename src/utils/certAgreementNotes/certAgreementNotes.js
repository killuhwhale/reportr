import { get, post } from '../../utils/requests'
import { BASE_URL } from '../../utils/environment'
import { lazyGet } from '../../utils/TSV'


class CertAgreementNotes {
    static async getAgreements(dairy_id) {
        // LazyGet Notes?
        const newAgreement = {
            dairy_id,
            nmp_developed: false,
            nmp_approved: false,
            nmp_updated: false,
            new_agreements: false
        }
        try {
            return await lazyGet('agreement', `noSearchValueNeeded`, newAgreement, dairy_id)
        } catch (e) {
            return { error: e.toString() }
        }
    }

    static async getNotes(dairy_id) {
        // LazyGet Notes?
        const newNote = {
            dairy_id, note: 'No notes.'
        }
        try {
            return await lazyGet('note', `noSearchValueNeeded`, newNote, dairy_id)
        } catch (e) {
            return { error: e.toString() }
        }
    }

    static async getCertification(dairy_id) {
        let newCertification = {
            dairy_id,
            owner_id: null,
            operator_id: null,
            responsible_id: null
        }

        try {
            return await lazyGet('certification', `noSearchValueNeeded`, newCertification, dairy_id)
        } catch (e) {
            return { error: e.toString() }
        }
    }

    static async onUpdateAgreement(agreement, dairy_id) {
        if (Object.keys(agreement).length < 5) {
            return {
                error: `Expected: nmp_updated, nmp_developed, nmp_approved,new_agreements, pk.
                        Received:  ${Object.keys(agreement).toString()}
            `}
        }
        try {
            return await post(`${BASE_URL}/api/agreement/update`, { ...agreement, dairy_id })
        } catch (e) {
            return { error: e.toString() }
        }

    }

    static async onUpdateNote(note, dairy_id) {
        if (!note || Object.keys(note).length !== 3 || note.pk <= 0) {
            console.log(Object.keys(note).length)
            return { error: 'Invalid notes given' }
        }

        try {
            return await post(`${BASE_URL}/api/note/update`, { ...note, dairy_id })
        } catch (e) {
            return { error: e.toString() }
        }
    }

    static async onUpdateCertification(owner, operator, responsible, dairy_id) {
        if (!owner || !operator || !responsible) {
            let msg = `${!owner ? 'Owner' : !operator ? 'Operator' : !responsible ? 'Responsible party' : 'Error:'} not found.`
            return { error: msg }
        }

        const certification = {
            dairy_id,
            owner_id: owner.pk,
            responsible_id: responsible.pk
        }

        if (operator.pk) {
            certification['operator_id'] = operator.pk
        }

        /** Valid combos
         *  Fields:     owner /            operator         / owner_operator_responsible_for_fees
         *           required / optional(unique from owner) /         required
         *    
         */
        // Owner and operator cannot be the same pk
        if (certification.owner_id !== certification.operator_id) {
            // If certiciation is created already, its pk will be stored and not -1
            try {
                return await post(`${BASE_URL}/api/certification/update`, { ...certification, dairy_id })
            } catch (e) {
                return { error: e.toString() }
            }
        } else {
            console.log("Owner and operator cannot be the same")
            return { error: "Owner and operator cannot be the same" }
        }
    }
}

export { CertAgreementNotes }