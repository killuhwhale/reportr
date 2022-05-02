const {
    S3, CreateBucketCommand, ListBucketsCommand, ListObjectsCommand, PutObjectCommand, GetObjectCommand
} = require("@aws-sdk/client-s3");

const { verifyToken, needsRead, verifyUserFromCompanyByCompanyID } = require('../utils/middleware');
const api = 'logo'


const SPACES_ENDPOINT_FULL = process.env.SPACES_ENDPOINT_FULL
const SPACES_ENDPOINT_EDGE = process.env.SPACES_ENDPOINT_EDGE
const SPACES_KEY = process.env.SPACES_KEY
const SPACES_SECRET = process.env.SPACES_SECRET
const BUCKET_NAME = 'reportrr'

class Spaces {
    static s3Client = new S3({
        endpoint: 'https://sfo3.digitaloceanspaces.com',
        region: "us-east-1",
        credentials: {
            accessKeyId: SPACES_KEY,
            secretAccessKey: SPACES_SECRET
        }
    });;
    static bucketParams = { Bucket: BUCKET_NAME };

    static uploadParams(filename, file) {
        return {
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: file
        }
    };

    static downloadParams(filename) {
        return {
            Bucket: BUCKET_NAME,
            Key: filename.toString(),
        }
    };


    static async listSpaces() {
        try {
            const data = await this.s3Client.send(new ListBucketsCommand({}));
            return data; // For unit tests.
        } catch (err) {
            console.log("Error", err);
        }
    }


    static async listObjects() {
        try {
            const data = await this.s3Client.send(new ListObjectsCommand(this.bucketParams));
            return data;
        } catch (err) {
            console.log("Error", err);
        }
    }


    static async uploadFile(filename, file) {
        try {
            const data = await this.s3Client.send(new PutObjectCommand(this.uploadParams(filename, file)));
            return data;
        } catch (err) {
            console.log("Errorzzz", err);
        }
    }



    static async getCompanyLogo(company_id, toBase64 = false) {
        const streamToString = (stream) => {
            const chunks = [];
            return new Promise((resolve, reject) => {
                stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
                stream.on('error', (err) => reject(err));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
            });
        };



        try {
            const response = await this.s3Client.send(new GetObjectCommand(this.downloadParams(company_id)));
            // const response = await this.s3Client.send(new GetObjectCommand(this.downloadParams('IMG_1192.jpg')));
            const data = await streamToString(response.Body);
            if (toBase64) {
                return `data:image/png;base64,${data.toString('base64')}`
            }

            return data

        } catch (err) {
            console.log(`getCompanyLogo(${company_id}) Error: `, err);
            return { error: err }
        }
    }




}

exports.Spaces = Spaces;