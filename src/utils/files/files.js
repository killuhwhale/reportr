import { BASE_URL } from '../environment'
import { getFile } from '../requests'

class Files {
    static async getFiles(title, dairy_id) {
        try {
            return await getFile(`${BASE_URL}/files/dairyFileSummary/${title}/${dairy_id}`)
        } catch (e) {
            return { error: "Unable to get Files" }
        }
    }
}

export { Files }