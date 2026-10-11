import type { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/authenticate';
import { IceServerService } from '../services/IceServerService';

export async function webrtcRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/ice-servers',
    { preHandler: authenticate },
    async (req, reply) => {
      const deviceId = (req as any).user?.sub;
      const iceServers = IceServerService.getIceServers(deviceId);
      return reply.send({
        success: true,
        iceServers,
      });
    }
  );
}
