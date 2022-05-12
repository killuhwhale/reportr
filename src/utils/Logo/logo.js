import { getImage, post, postImage } from '../requests'
import { BASE_URL } from '../environment'


class Logo {
    static getLogo(company_id) {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await getImage(`${BASE_URL}/logo/${company_id}`)

                var reader = new FileReader();


                reader.onload = (e) => {
                    resolve(e.target.result)
                }
                reader.onerror = (err) => {
                    reject(err)
                }

                const arrayBuffer = res.url.data
                let bytes = new Uint8Array(arrayBuffer);
                let blob = new Blob([bytes.buffer]);
                reader.readAsDataURL(blob);


            } catch (e) {
                return { error: e }
            }
        })
    }

    static async uploadLogo(file, filetype, company_id) {
        try {
            let formData = new FormData();
            formData.append("file", file)
            formData.append("filetype", filetype)
            formData.append("company_id", company_id)
            return await postImage(`${BASE_URL}/logo/upload`, formData)
        } catch (e) {
            return { error: e }
        }
    }

    static async deleteLogo(company_id) {
        try {
            return await post(`${BASE_URL}/logo/delete`, { company_id })
        } catch (e) {
            return { error: e }
        }
    }
}

export { Logo }