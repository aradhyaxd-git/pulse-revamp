import { prisma } from '../../lib/prisma';
import { notificationQueue } from '../../lib/queue';
import { emailService } from '../../lib/email';

export const notificationsService = {
  async enqueueForOrder(orderId: string, toStatus: string, customerEmail: string) {
    let subject = `Order Update`;
    let body = `Your order status has been updated.`;
    
    switch (toStatus) {
      case 'CREATED':
        subject = "Order Confirmed";
        body = "Your order has been placed successfully and is awaiting an agent.";
        break;
      case 'AGENT_ASSIGNED':
        subject = "Agent Assigned";
        body = "A delivery agent has been assigned to your order and will pick it up soon.";
        break;
      case 'PICKED_UP':
        subject = "Order Picked Up";
        body = "Your order has been picked up by our delivery agent.";
        break;
      case 'IN_TRANSIT':
        subject = "Order In Transit";
        body = "Your order is currently in transit and on its way to the destination.";
        break;
      case 'DELIVERED':
        subject = "Order Delivered";
        body = "Your order has been successfully delivered. Thank you for choosing mile.delivr!";
        break;
      case 'FAILED':
        subject = "Delivery Failed";
        body = "Unfortunately, we were unable to deliver your order. Please check your account to reschedule.";
        break;
      case 'RESCHEDULED':
        subject = "Order Rescheduled";
        body = "Your order has been successfully rescheduled and will be reassigned.";
        break;
      default:
        subject = `Order Update: ${toStatus.replace(/_/g, ' ')}`;
        body = `Your order status has been updated to: ${toStatus.replace(/_/g, ' ')}. Log in to track your delivery.`;
    }

    // Insert EMAIL outbox row (within the caller's transaction context ideally, but here as fallback)
    const emailOutbox = await prisma.notificationOutbox.create({
      data: {
        orderId,
        channel: 'EMAIL',
        payload: { to: customerEmail, subject, body, orderStatus: toStatus },
        status: 'PENDING',
      },
    });

    await notificationQueue.add('send-notification', {
      outboxId: emailOutbox.id,
      orderId,
      channel: 'EMAIL',
      payload: { to: customerEmail, subject, body, orderStatus: toStatus },
    });

  },

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    const html = `
      <h2>Status Update</h2>
      <p>${body}</p>
    `;
    return emailService.sendEmail(to, subject, html);
  },
};