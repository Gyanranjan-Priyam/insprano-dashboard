/**
 * Script to fix event priceType values for existing events
 * Run this script if you have events that were created before the priceType field was added
 * 
 * This script will:
 * - Set priceType to "paid" for events with price > 0
 * - Set priceType to "free" for events with price = 0
 * 
 * Usage: npx tsx scripts/fix-event-price-types.ts
 */

import { prisma } from '../lib/db';

async function fixEventPriceTypes() {
  console.log('Starting to fix event priceType values...');

  try {
    // Get all events
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        priceType: true,
      }
    });

    console.log(`Found ${events.length} events`);

    let updatedCount = 0;

    for (const event of events) {
      const shouldBePaid = event.price > 0;
      const shouldBeFree = event.price === 0;
      
      let newPriceType: 'free' | 'paid' | null = null;

      // Determine the correct priceType based on price
      if (shouldBePaid && event.priceType === 'free') {
        newPriceType = 'paid';
      } else if (shouldBeFree && event.priceType === 'paid') {
        newPriceType = 'free';
      }

      if (newPriceType) {
        console.log(`Updating "${event.title}" (price: ₹${event.price}) from "${event.priceType}" to "${newPriceType}"`);
        
        await prisma.event.update({
          where: { id: event.id },
          data: { priceType: newPriceType }
        });
        
        updatedCount++;
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} events`);
    console.log('Price type fix completed!');

  } catch (error) {
    console.error('❌ Error fixing event price types:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  fixEventPriceTypes()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { fixEventPriceTypes };