import ky from 'ky';
import { Hex } from 'viem';

interface HexSignatureResponse {
  count: number;
  next: null;
  previous: null;
  results: {
    id: number;
    created_at: string;
    text_signature: string;
    hex_signature: Hex;
    bytes_signature: string;
  }[];
}

class Service {
  async getSignature(signature: Hex): Promise<string | null> {
    const response = await ky.get(
      `https://www.4byte.directory/api/v1/signatures/?hex_signature=${signature}`,
    );
    const data = await response.json<HexSignatureResponse>();
    if (data.count === 0) {
      return null;
    }
    const firstResult = data.results[0];
    return firstResult ? firstResult.text_signature : null;
  }
}

export default Service;
