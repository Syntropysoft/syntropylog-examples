// =================================================================
//  FILE: src/RabbitMQAdapter.ts
//  RESPONSIBILITY: Defines the adapter class for RabbitMQ using amqplib
// =================================================================

import * as amqp from 'amqplib';
import {
  IBrokerAdapter,
  BrokerMessage,
  MessageHandler,
  MessageLifecycleControls,
} from 'syntropylog';

export interface RabbitMQConfig {
  url: string;
  exchange: string;
  queue: string;
  routingKey?: string;
}

export class RabbitMQAdapter implements IBrokerAdapter {
  private connection?: amqp.Connection;
  private channel?: amqp.Channel;
  private consumerTag?: string;
  private config: RabbitMQConfig;

  constructor(config: RabbitMQConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();
      
      // Ensure exchange exists
      await this.channel.assertExchange(this.config.exchange, 'topic', { durable: true });
      
      // Ensure queue exists
      await this.channel.assertQueue(this.config.queue, { durable: true });
      
      // Bind queue to exchange
      const routingKey = this.config.routingKey || '#';
      await this.channel.bindQueue(this.config.queue, this.config.exchange, routingKey);
    } catch (error) {
      throw new Error(`Failed to connect to RabbitMQ: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      console.log('🔄 RabbitMQAdapter: Starting disconnect...');
      
      // Cancel consumer if active and channel is open
      if (this.channel && this.consumerTag && !this.channel.closed) {
        console.log(`🔄 RabbitMQAdapter: Cancelling consumer with tag: ${this.consumerTag}`);
        await this.channel.cancel(this.consumerTag);
        console.log('✅ RabbitMQAdapter: Consumer cancelled successfully');
      } else {
        console.log('ℹ️ RabbitMQAdapter: No consumer to cancel or channel already closed');
      }
      
      // Close channel if it exists and is not already closed
      if (this.channel && !this.channel.closed) {
        console.log('🔄 RabbitMQAdapter: Closing channel...');
        await this.channel.close();
        console.log('✅ RabbitMQAdapter: Channel closed successfully');
      } else {
        console.log('ℹ️ RabbitMQAdapter: Channel already closed or doesn\'t exist');
      }
      
      // Close connection if it exists and is not already closed
      if (this.connection && !this.connection.closed) {
        console.log('🔄 RabbitMQAdapter: Closing connection...');
        await this.connection.close();
        console.log('✅ RabbitMQAdapter: Connection closed successfully');
      } else {
        console.log('ℹ️ RabbitMQAdapter: Connection already closed or doesn\'t exist');
      }
      
      // Clear references
      this.channel = undefined;
      this.connection = undefined;
      this.consumerTag = undefined;
      
      console.log('✅ RabbitMQAdapter: Disconnect completed');
    } catch (error) {
      console.error('❌ RabbitMQAdapter: Error during disconnect:', error);
      // Don't throw error on disconnect - just log it
      console.log('ℹ️ RabbitMQAdapter: Continuing with disconnect despite error');
    }
  }

  async publish(topic: string, message: BrokerMessage): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      const headers = message.headers || {};
      
      // Convert headers to RabbitMQ format
      const rabbitHeaders: amqp.Options.Publish = {
        headers: headers as Record<string, any>,
        persistent: true,
      };

      await this.channel.publish(
        this.config.exchange,
        topic,
        message.payload,
        rabbitHeaders
      );
    } catch (error) {
      throw new Error(`Failed to publish message to RabbitMQ: ${error}`);
    }
  }

  async subscribe(topic: string, handler: MessageHandler): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      console.log(`🔄 RabbitMQAdapter: Starting subscription to queue: ${this.config.queue}`);
      
      const result = await this.channel.consume(this.config.queue, async (msg) => {
        if (!msg) {
          return;
        }

        const brokerMessage: BrokerMessage = {
          payload: msg.content,
          headers: msg.properties.headers as Record<string, string | Buffer>,
        };

        const controls: MessageLifecycleControls = {
          ack: async () => {
            await this.channel!.ack(msg);
          },
          nack: async (requeue?: boolean) => {
            await this.channel!.nack(msg, false, requeue ?? true);
          },
        };

        await handler(brokerMessage, controls);
      });

      // Store the consumer tag for later cancellation
      this.consumerTag = result.consumerTag;
      console.log(`✅ RabbitMQAdapter: Subscription started with consumer tag: ${this.consumerTag}`);
    } catch (error) {
      console.error('❌ RabbitMQAdapter: Error during subscription:', error);
      throw new Error(`Failed to subscribe to RabbitMQ queue: ${error}`);
    }
  }

  async unsubscribe(topic: string): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    if (!this.consumerTag) {
      console.warn(`No active subscription found for topic: ${topic}`);
      return;
    }

    try {
      console.log(`🔄 RabbitMQAdapter: Unsubscribing from topic: ${topic} with consumer tag: ${this.consumerTag}`);
      await this.channel.cancel(this.consumerTag);
      this.consumerTag = undefined;
      console.log(`✅ RabbitMQAdapter: Successfully unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`❌ RabbitMQAdapter: Error unsubscribing from topic ${topic}:`, error);
      throw new Error(`Failed to unsubscribe from RabbitMQ topic: ${error}`);
    }
  }
} 