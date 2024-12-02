import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { CloudFrontClient, CreateDistributionCommand } from "@aws-sdk/client-cloudfront";

// Initialize AWS clients
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const cloudfrontClient = new CloudFrontClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export class AWSService {
  private static readonly BUCKET_NAME = process.env.AWS_S3_BUCKET || 'secure-connect-bucket';

  // Upload file to S3
  static async uploadFile(file: File, key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read'
    });

    await s3Client.send(command);
    return `https://${this.BUCKET_NAME}.s3.amazonaws.com/${key}`;
  }

  // Get file from S3
  static async getFile(key: string): Promise<any> {
    const command = new GetObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key
    });

    const response = await s3Client.send(command);
    return response.Body;
  }

  // Create CloudFront distribution
  static async createDistribution(domainName: string) {
    const command = new CreateDistributionCommand({
      DistributionConfig: {
        CallerReference: Date.now().toString(),
        Comment: 'SecureConnect CDN Distribution',
        DefaultCacheBehavior: {
          TargetOriginId: this.BUCKET_NAME,
          ViewerProtocolPolicy: 'redirect-to-https',
          AllowedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
          },
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
          },
          ForwardedValues: {
            QueryString: false,
            Cookies: {
              Forward: 'none'
            }
          },
          MinTTL: 0,
          DefaultTTL: 86400,
          MaxTTL: 31536000,
        },
        Enabled: true,
        Origins: {
          Quantity: 1,
          Items: [
            {
              Id: this.BUCKET_NAME,
              DomainName: `${this.BUCKET_NAME}.s3.amazonaws.com`,
              S3OriginConfig: {
                OriginAccessIdentity: ''
              }
            }
          ]
        },
        PriceClass: 'PriceClass_All',
      }
    });

    return cloudfrontClient.send(command);
  }
}