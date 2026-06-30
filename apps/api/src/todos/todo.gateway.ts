import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { JwtPayload } from '../common/strategies/jwt.strategy';

/**
 * Real-time collaboration via WebSockets (Socket.io).
 *
 * Flow:
 * 1. Frontend connects with a valid JWT: ws://localhost:3000?token=<jwt>
 * 2. On connect, we validate the token and store tenantId on the socket.
 * 3. Frontend emits "board:join" with a boardId to subscribe to a board's feed.
 * 4. We put the socket in a Socket.io "room" named after the board.
 * 5. When any todo changes (create/update/delete), TodosService calls
 *    emitToBoard(), which broadcasts to everyone in that room.
 *
 * Security: users can only join boards in their own tenant (checked below).
 * We don't re-validate every emit — that's handled in the REST API.
 */
@WebSocketGateway({
  cors: { origin: '*' }, // Tighten this in production
  namespace: '/',
})
export class TodosGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TodosGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Token is passed as a query param on connect
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token as string;

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'change-me',
      });

      // Store user info on the socket for later use.
      // The active tenant is whichever org this token was issued for.
      client.data.userId = payload.sub;
      client.data.tenantId = payload.activeTenantId;

      this.logger.log(
        `Client connected: ${client.id} (user: ${payload.sub}, tenant: ${payload.activeTenantId})`,
      );
    } catch (err) {
      this.logger.warn(`Client ${client.id} sent invalid token, disconnecting`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Client emits "board:join" with { boardId } to start receiving
   * updates for that board. We put them in a room named `board:<id>`.
   *
   * The room name includes tenantId to prevent cross-tenant room guessing:
   * even if someone crafts a join message with a foreign boardId,
   * their token's tenantId won't match the room prefix used in emitToBoard.
   */
  @SubscribeMessage('board:join')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ) {
    const roomName = `tenant:${client.data.tenantId}:board:${data.boardId}`;
    client.join(roomName);
    this.logger.log(`Client ${client.id} joined room ${roomName}`);
    return { event: 'board:joined', data: { boardId: data.boardId } };
  }

  @SubscribeMessage('board:leave')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ) {
    const roomName = `tenant:${client.data.tenantId}:board:${data.boardId}`;
    client.leave(roomName);
    return { event: 'board:left', data: { boardId: data.boardId } };
  }

  /**
   * Called by TodosService after every mutation.
   * Only broadcasts to sockets that have joined THIS board within THIS tenant.
   */
  emitToBoardForTenant(tenantId: string, boardId: string, event: string, data: any) {
    const roomName = `tenant:${tenantId}:board:${boardId}`;
    this.server.to(roomName).emit(event, data);
    this.logger.log(`Emitted "${event}" to room ${roomName}`);
  }
}
