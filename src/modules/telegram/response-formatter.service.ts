import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseFormatterService {
  private escapeMarkdown(text: string): string {
    return text?.toString().replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1') || '';
  }

  private createFoursquareUrl(venueId: string): string {
    return `https://foursquare.com/v/${venueId}`;
  }

  formatVenueList(data: any): { text: string; keyboard?: any } {
    if (!data.venues || !Array.isArray(data.venues)) {
      return { text: '😕 No venues found. Try a different search!' };
    }

    let text = `✨ Found ${data.total || data.venues.length} Amazing Places!\n`;
    text += `🔍 "${this.escapeMarkdown(data.query || '')}"\n\n`;
    
    // Create inline keyboard for venue selection
    const keyboard = {
      inline_keyboard: []
    };

    data.venues.forEach((venue, index) => {
      // Header with name
      text += `${index + 1}. *${this.escapeMarkdown(venue.name)}*`;
      
      // Rating if available
      if (venue.rating && venue.rating !== 'No rating') {
        const rating = parseFloat(venue.rating);
        text += ` ${rating >= 4.5 ? '⭐️' : ''}${rating >= 4.0 ? '⭐️' : ''}${rating >= 3.5 ? '⭐️' : ''}${rating >= 3.0 ? '⭐️' : ''}${rating >= 2.5 ? '⭐️' : ''} ${rating}`;
      }
      text += '\n';
      
      // Location and category in a clean format
      if (venue.address) {
        text += `📍 ${this.escapeMarkdown(venue.address)}\n`;
      }
      if (venue.category) {
        text += `🏷️ ${this.escapeMarkdown(venue.category)}`;
      }
      
      // Price and distance in a more readable format
      let details = [];
      if (venue.price && venue.price !== 'Price not available') {
        details.push(`💰 ${venue.price.replace(/[^$€£¥]/g, '')}`);
      }
      if (venue.distance) {
        const dist = parseFloat(venue.distance);
        details.push(`📏 ${dist < 1000 ? Math.round(dist) + 'm' : (dist/1000).toFixed(1) + 'km'}`);
      }
      if (details.length > 0) {
        text += `\n${details.join(' • ')}`;
      }
      
      // Opening hours if available
      if (venue.hours?.display) {
        text += `\n🕒 ${this.escapeMarkdown(venue.hours.display)}`;
      }

      // Add "View Details" button for this venue
      keyboard.inline_keyboard.push([
        {
          text: `📍 View ${venue.name}`,
          callback_data: `venue_${venue.fsq_id}`
        }
      ]);
      
      text += '\n\n';
    });

    text += '\n💡 Select a venue to see more details:\n';
    text += '• Click the buttons below\n';
    text += `• Or type a number (1-${data.venues.length})`;

    return { text, keyboard };
  }

  formatVenueDetails(venue: any): { text: string; keyboard?: any } {
    // Venue name and category as header
    let text = `✨ *${this.escapeMarkdown(venue.name)}*\n`;
    if (venue.category) {
      text += `🏷️ ${this.escapeMarkdown(venue.category)}\n`;
    }
    text += '\n';
    
    // Address and distance
    if (venue.address) {
      text += `📍 ${this.escapeMarkdown(venue.address)}`;
      if (venue.distance) {
        const dist = parseFloat(venue.distance);
        text += ` • ${dist < 1000 ? Math.round(dist) + 'm' : (dist/1000).toFixed(1) + 'km'} away`;
      }
      text += '\n\n';
    }
    
    // Rating with stars visualization
    if (venue.rating && venue.rating !== 'No rating') {
      const rating = parseFloat(venue.rating);
      text += `⭐️ *Rating:* ${rating >= 4.5 ? '⭐️' : ''}${rating >= 4.0 ? '⭐️' : ''}${rating >= 3.5 ? '⭐️' : ''}${rating >= 3.0 ? '⭐️' : ''}${rating >= 2.5 ? '⭐️' : ''} ${rating}/5\n`;
    }
    
    // Price with currency symbol
    if (venue.price && venue.price !== 'Price not available') {
      text += `💰 *Price:* ${venue.price.replace(/[^$€£¥]/g, '')} (${venue.price})\n`;
    }
    
    // Opening hours with status
    if (venue.hours) {
      text += '\n🕒 ';
      if (venue.hours.open_now) {
        text += '*Open Now* • ';
      } else if (venue.hours.open_now === false) {
        text += '*Closed* • ';
      }
      if (venue.hours.display) {
        text += `${this.escapeMarkdown(venue.hours.display)}`;
      }
      text += '\n';
    }
    
    // Tips or Highlights if available
    if (venue.description) {
      text += `\n📝 *Description:*\n${this.escapeMarkdown(venue.description)}\n`;
    }
    
    // Contact Info
    if (venue.tel) {
      text += `\n📞 *Phone:* ${this.escapeMarkdown(venue.tel)}\n`;
    }
    if (venue.website) {
      text += `🌐 *Website:* ${venue.website}\n`;
    }
    
    // Add Foursquare link
    if (venue.fsq_id) {
      text += `\n🔗 [View on Foursquare](${this.createFoursquareUrl(venue.fsq_id)})\n`;
    }
    
    // Add photo if available
    if (venue.photos && venue.photos.length > 0) {
      text += `\n[📸](${venue.photos[0]}) `;
    }

    // Create keyboard with useful actions
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '📍 Open in Maps',
            url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + ' ' + (venue.address || ''))}`
          }
        ],
        [
          {
            text: '🔙 Back to List',
            callback_data: 'back_to_venues'
          },
          {
            text: '📱 Share Venue',
            callback_data: `share_venue_${venue.fsq_id}`
          }
        ]
      ]
    };

    return { text, keyboard };
  }

  formatToolResult(result: any): { text: string; keyboard?: any } {
    if (!result.success) {
      return this.formatError(result.result);
    }

    let data = result.result;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return { text: data };
      }
    }

    if (data.venues) {
      return this.formatVenueList(data);
    }

    return {
      text: typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    };
  }

  formatError(error: string): { text: string } {
    return {
      text: `❌ Error: ${this.escapeMarkdown(error)}`
    };
  }
}
