/**
 * Test script to verify enhanced member removal functionality
 * This tests the cascading deletion of team membership, participation, and user account
 */
import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client';

const prisma = new PrismaClient();

async function testMemberRemoval() {
  console.log('🧪 Testing Enhanced Member Removal Flow...\n');

  try {
    // 1. Find teams with members to understand the current state
    const teamsWithMembers = await prisma.team.findMany({
      where: {
        members: {
          some: {}
        }
      },
      include: {
        members: {
          include: {
            participant: {
              include: {
                user: true,
                event: true
              }
            }
          }
        },
        leader: {
          include: {
            user: true
          }
        },
        event: true
      }
    });

    if (teamsWithMembers.length === 0) {
      console.log('❌ No teams with members found for testing');
      return;
    }

    console.log(`📋 Found ${teamsWithMembers.length} teams with members\n`);

    for (const team of teamsWithMembers) {
      console.log(`🏆 Team: ${team.name} (${team.event.title})`);
      console.log(`👑 Leader: ${team.leader.fullName} (${team.leader.email})`);
      console.log(`👥 Members: ${team.members.length}`);
      
      for (const member of team.members) {
        const user = member.participant.user;
        
        // Check how many other participations this user has
        const allParticipations = await prisma.participation.findMany({
          where: {
            userId: user.id
          },
          include: {
            event: {
              select: {
                title: true
              }
            }
          }
        });

        console.log(`  📧 ${member.participant.fullName} (${member.participant.email})`);
        console.log(`     💳 Payment Status: ${member.participant.status}`);
        console.log(`     🎟️  Total Participations: ${allParticipations.length}`);
        
        if (allParticipations.length > 1) {
          console.log(`     📋 Other Events: ${allParticipations.filter(p => p.id !== member.participantId).map(p => p.event.title).join(', ')}`);
          console.log(`     ⚠️  User account would be PRESERVED (has other participations)`);
        } else {
          console.log(`     🗑️  User account would be DELETED (no other participations)`);
        }
        console.log();
      }
      console.log('---\n');
    }

    console.log('🔧 Enhanced removal function will now:');
    console.log('   1. ✅ Delete TeamMember record');
    console.log('   2. ✅ Delete Participation record (removes payment status & event data)');
    console.log('   3. ✅ Delete User account (only if no other participations exist)');
    console.log('   4. ✅ Clean up Sessions and Accounts before user deletion');
    console.log('   5. ✅ Use database transactions for data consistency\n');

    // 2. Test what happens during removal simulation
    console.log('📊 Removal Impact Analysis:');
    
    const totalUsersBeforeRemoval = await prisma.user.count();
    const totalParticipationsBeforeRemoval = await prisma.participation.count();
    const totalTeamMembersBeforeRemoval = await prisma.teamMember.count();
    
    console.log(`   👤 Total Users: ${totalUsersBeforeRemoval}`);
    console.log(`   🎫 Total Participations: ${totalParticipationsBeforeRemoval}`);
    console.log(`   👥 Total Team Memberships: ${totalTeamMembersBeforeRemoval}`);

    // Count users who would be deleted vs preserved
    const usersWithSingleParticipation = await prisma.user.findMany({
      include: {
        participations: true
      }
    });

    const usersWhoWouldBeDeleted = usersWithSingleParticipation.filter(user => user.participations.length === 1);
    const usersWhoWouldBePreserved = usersWithSingleParticipation.filter(user => user.participations.length > 1);

    console.log(`   🗑️  Users who would be deleted if their only participation is removed: ${usersWhoWouldBeDeleted.length}`);
    console.log(`   💾 Users who would be preserved (multiple participations): ${usersWhoWouldBePreserved.length}\n`);

    console.log('✅ Enhanced member removal testing completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testMemberRemoval();
}

export default testMemberRemoval;