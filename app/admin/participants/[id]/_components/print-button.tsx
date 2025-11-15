"use client";

import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";

interface PrintButtonProps {
  participantName: string;
  participantData?: any; // Optional: full participant data for comprehensive printing
}

export default function PrintButton({ participantName, participantData }: PrintButtonProps) {
  const handlePrint = () => {
    // Enhanced print-specific styles for comprehensive multi-page layout
    const printStyles = `
      <style>
        @media print {
          * {
            visibility: hidden;
            margin: 0;
            padding: 0;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            font-family: Arial, sans-serif;
            color: #000;
            background: #fff;
          }
          .no-print {
            display: none !important;
          }
          
          /* Page Setup */
          body {
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 15mm;
          }
          
          /* Header Section */
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #000;
            page-break-after: avoid;
          }
          .print-header h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 10px 0;
            text-transform: uppercase;
          }
          .print-header .subtitle {
            font-size: 14px;
            color: #666;
            margin: 5px 0;
          }
          .print-header .participant-name {
            font-size: 18px;
            font-weight: bold;
            margin: 15px 0 10px 0;
            color: #333;
          }
          .print-header .status-info {
            margin-top: 15px;
          }
          .print-status-badge {
            display: inline-block;
            padding: 6px 12px;
            border: 2px solid #000;
            font-weight: bold;
            text-transform: uppercase;
            background: #f5f5f5;
          }
          
          /* Section Headers */
          .print-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
            border: 1px solid #ddd;
            padding: 15px;
            background: #fff;
          }
          .print-section h2 {
            background: linear-gradient(to right, #333, #666);
            color: white;
            padding: 10px 15px;
            margin: -15px -15px 20px -15px;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .print-section h3 {
            background-color: #f8f8f8;
            padding: 8px 12px;
            margin: 15px -15px 15px -15px;
            font-weight: bold;
            font-size: 12px;
            border-left: 4px solid #333;
            color: #333;
          }
          
          /* Grid Layouts */
          .print-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
          }
          .print-grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          .print-full-width {
            grid-column: 1 / -1;
          }
          
          /* Field Styling */
          .print-item {
            margin-bottom: 12px;
            break-inside: avoid;
          }
          .print-label {
            font-weight: bold;
            color: #333;
            display: block;
            margin-bottom: 3px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .print-value {
            color: #000;
            font-size: 11px;
            padding: 4px 8px;
            background: #f9f9f9;
            border-left: 3px solid #ddd;
            word-wrap: break-word;
          }
          .print-value-highlight {
            background: #e8f4fd;
            border-left-color: #2563eb;
            font-weight: bold;
          }
          
          /* Team Information */
          .print-team-header {
            background: #2563eb;
            color: white;
            padding: 8px 12px;
            margin-bottom: 10px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .print-team-member {
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 8px;
            background: #f9f9f9;
            break-inside: avoid;
          }
          .print-team-member-header {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
            padding-bottom: 3px;
            border-bottom: 1px solid #ddd;
          }
          .print-team-leader {
            background: #fff3cd;
            border-color: #ffc107;
          }
          
          /* Payment Information */
          .print-payment-section {
            background: #f0f8f0;
            border: 2px solid #28a745;
            padding: 15px;
            margin: 20px 0;
          }
          .print-payment-header {
            font-size: 14px;
            font-weight: bold;
            color: #28a745;
            margin-bottom: 15px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .print-payment-amount {
            font-size: 16px;
            font-weight: bold;
            color: #28a745;
            text-align: center;
            padding: 10px;
            background: white;
            border: 1px solid #28a745;
            margin: 10px 0;
          }
          
          /* Timeline */
          .print-timeline {
            border-left: 3px solid #333;
            padding-left: 15px;
            margin: 20px 0;
          }
          .print-timeline-item {
            position: relative;
            margin-bottom: 15px;
            padding-left: 20px;
          }
          .print-timeline-item:before {
            content: "●";
            position: absolute;
            left: -8px;
            top: 0;
            color: #333;
            font-size: 12px;
          }
          .print-timeline-date {
            font-weight: bold;
            color: #333;
          }
          .print-timeline-desc {
            color: #666;
            font-size: 10px;
            margin-top: 2px;
          }
          
          /* Tables */
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          .print-table th {
            background: #333;
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
          }
          .print-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #ddd;
            font-size: 10px;
          }
          .print-table tr:nth-child(even) {
            background: #f9f9f9;
          }
          
          /* Page Breaks */
          .print-page-break {
            page-break-before: always;
          }
          .print-avoid-break {
            page-break-inside: avoid;
          }
          
          /* Footer */
          .print-footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #666;
          }
          
          /* Contact Info Highlights */
          .print-contact-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
          }
          .print-contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px;
          }
          
          /* Event Details Highlight */
          .print-event-highlight {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .print-event-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .print-event-details {
            font-size: 12px;
          }
          
          /* Responsive adjustments for print */
          @page {
            margin: 20mm;
            size: A4;
          }
        }
      </style>
    `;

    // Get the current page content
    const printContentElement = document.querySelector('.print-content');
    if (!printContentElement) {
      alert('Print content not found. Please try again.');
      return;
    }

    // Extract all participant data from the page or use passed data
    const participantInfo = participantData || extractParticipantData();
    
    // Create comprehensive print content
    const comprehensivePrintContent = generateComprehensivePrintContent(participantInfo);

    // Create a new window with enhanced print content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Participant Comprehensive Report - ${participantName}</title>
            <meta charset="utf-8">
            ${printStyles}
          </head>
          <body>
            ${comprehensivePrintContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const extractParticipantData = () => {
    // Extract participant data from the current page DOM
    const participant = {
      fullName: document.querySelector('[class*="truncate"]')?.textContent?.trim() || participantName,
      email: '',
      mobileNumber: '',
      whatsappNumber: '',
      aadhaarNumber: '',
      state: '',
      district: '',
      collegeName: '',
      collegeAddress: '',
      status: '',
      registeredAt: '',
      paymentSubmittedAt: '',
      paymentVerifiedAt: '',
      event: {
        title: '',
        category: '',
        date: '',
        venue: '',
        price: ''
      },
      user: {
        email: '',
        createdAt: ''
      },
      teamInfo: {
        role: '',
        teamName: '',
        memberCount: 0,
        members: []
      }
    };

    // Extract data from visible elements (this is a simplified extraction)
    // In a real implementation, you might want to pass this data as props
    try {
      // Extract basic info
      const statusElement = document.querySelector('[class*="Badge"]');
      if (statusElement) {
        participant.status = statusElement.textContent?.trim() || '';
      }

      // Extract event info
      const eventElements = document.querySelectorAll('[class*="text-sm"], [class*="text-xs"]');
      eventElements.forEach(el => {
        const text = el.textContent?.trim() || '';
        if (text.includes('₹')) {
          participant.event.price = text;
        }
      });

    } catch (error) {
      console.error('Error extracting participant data:', error);
    }

    return participant;
  };

  const generateComprehensivePrintContent = (participant: any) => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    // Helper function to format dates
    const formatDate = (dateStr: string | Date) => {
      if (!dateStr) return 'Not provided';
      try {
        return new Date(dateStr).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return 'Invalid date';
      }
    };

    // Get team information
    const getTeamInfo = () => {
      if (participant.teamLeader && participant.teamLeader.length > 0) {
        const team = participant.teamLeader[0];
        return {
          role: 'Team Leader',
          teamName: team.name || 'Unnamed Team',
          memberCount: team.members?.length || 0,
          maxMembers: team.maxMembers || 0,
          members: team.members || [],
          isLeader: true
        };
      } else if (participant.teamMember && participant.teamMember.length > 0) {
        const membership = participant.teamMember[0];
        return {
          role: 'Team Member',
          teamName: membership.team?.name || 'Team Information Available',
          memberCount: membership.team?.members?.length || 0,
          maxMembers: membership.team?.maxMembers || 0,
          members: membership.team?.members || [],
          isLeader: false,
          leader: membership.team?.leader || {}
        };
      }
      return {
        role: 'Individual Participant',
        teamName: null,
        memberCount: 0,
        members: [],
        isLeader: false
      };
    };

    const teamInfo = getTeamInfo();
    
    return `
      <!-- Page 1: Header and Basic Information -->
      <div class="print-content">
        <div class="print-header">
          <h1>INSPRANO 2025 - Participant Comprehensive Report</h1>
          <div class="subtitle">Complete Participant Information & Registration Details</div>
          <div class="participant-name">Participant: ${participant.fullName || participantName}</div>
          <div class="status-info">
            <div class="print-status-badge">Status: ${(participant.status || 'REGISTERED').replace('_', ' ')}</div>
          </div>
          <div class="subtitle">Generated on: ${currentDate} at ${currentTime}</div>
        </div>

        <!-- Basic Information Section -->
        <div class="print-section">
          <h2>📋 Personal Information</h2>
          <div class="print-grid">
            <div class="print-item">
              <span class="print-label">Full Name</span>
              <div class="print-value print-value-highlight">${participant.fullName || participantName}</div>
            </div>
            <div class="print-item">
              <span class="print-label">Email Address</span>
              <div class="print-value">${participant.email || participant.user?.email || 'Not provided'}</div>
            </div>
            <div class="print-item">
              <span class="print-label">Mobile Number</span>
              <div class="print-value">${participant.mobileNumber || 'Not provided'}</div>
            </div>
            <div class="print-item">
              <span class="print-label">WhatsApp Number</span>
              <div class="print-value">${participant.whatsappNumber || 'Not provided'}</div>
            </div>
            <div class="print-item">
              <span class="print-label">Aadhaar Number</span>
              <div class="print-value">${participant.aadhaarNumber || 'Not provided'}</div>
            </div>
            <div class="print-item">
              <span class="print-label">Registration Status</span>
              <div class="print-value print-value-highlight">${(participant.status || 'REGISTERED').replace('_', ' ')}</div>
            </div>
          </div>
        </div>

        <!-- Location Information -->
        <div class="print-section">
          <h2>📍 Location Details</h2>
          <div class="print-grid">
            <div class="print-item">
              <span class="print-label">State</span>
              <div class="print-value">${participant.state || 'Not provided'}</div>
            </div>
            <div class="print-item">
              <span class="print-label">District</span>
              <div class="print-value">${participant.district || 'Not provided'}</div>
            </div>
          </div>
        </div>

        <!-- Education Information -->
        <div class="print-section">
          <h2>🎓 Educational Information</h2>
          <div class="print-item print-full-width">
            <span class="print-label">College/Institution Name</span>
            <div class="print-value">${participant.collegeName || 'Not provided'}</div>
          </div>
          <div class="print-item print-full-width">
            <span class="print-label">College Address</span>
            <div class="print-value">${participant.collegeAddress || 'Not provided'}</div>
          </div>
        </div>

        <!-- Event Information Highlight -->
        <div class="print-event-highlight print-avoid-break">
          <div class="print-event-title">${participant.event?.title || 'Event Information'}</div>
          <div class="print-event-details">
            <strong>Category:</strong> ${participant.event?.category || 'Not specified'}<br>
            <strong>Date:</strong> ${participant.event?.date ? formatDate(participant.event.date) : 'Date not specified'}<br>
            <strong>Venue:</strong> ${participant.event?.venue || 'Venue not specified'}<br>
            <strong>Registration Fee:</strong> ₹${participant.event?.price || 'Fee not specified'}
          </div>
        </div>

        <!-- Payment Information Section -->
        <div class="print-payment-section print-avoid-break">
          <div class="print-payment-header">💳 Payment & Financial Information</div>
          
          <div class="print-grid">
            <div class="print-item">
              <span class="print-label">Registration Fee</span>
              <div class="print-value">₹${participant.event?.price || 'Not specified'}</div>
            </div>
            <div class="print-item">
              <span class="print-label">Payment Amount</span>
              <div class="print-value">₹${participant.paymentAmount || participant.event?.price || 'Not specified'}</div>
            </div>
            <div class="print-item">
              <span class="print-label">Payment Method</span>
              <div class="print-value">Online Transfer (UPI/Bank Transfer)</div>
            </div>
            <div class="print-item">
              <span class="print-label">Payment Status</span>
              <div class="print-value print-value-highlight">
                ${participant.status === 'CONFIRMED' ? 'Payment Verified ✅' : 
                  participant.status === 'PAYMENT_SUBMITTED' ? 'Payment Under Review ⏳' : 
                  participant.status === 'PENDING_PAYMENT' ? 'Payment Pending ⏸️' : 
                  'Processing'}
              </div>
            </div>
            <div class="print-item">
              <span class="print-label">Transaction ID</span>
              <div class="print-value">${participant.transactionId || 'Not provided / Under processing'}</div>
            </div>
            <div class="print-item">
              <span class="print-label">Payment Screenshot</span>
              <div class="print-value">${participant.paymentScreenshotKey ? 'Uploaded and verified' : 'Not uploaded'}</div>
            </div>
          </div>
          
          <div class="print-payment-amount">
            Total Amount: ₹${participant.paymentAmount || participant.event?.price || 'Not specified'}
          </div>
        </div>

        <!-- Page Break for Team Information -->
        <div class="print-page-break"></div>

        <!-- Team Information Section -->
        <div class="print-section">
          <h2>👥 Team Participation Details</h2>
          <div class="print-team-header">
            🏆 ${teamInfo.role} - Team Membership Information
          </div>
          
          <div class="print-grid">
            <div class="print-item">
              <span class="print-label">Team Participation Role</span>
              <div class="print-value print-value-highlight">${teamInfo.role}</div>
            </div>
            
            ${teamInfo.teamName ? `
            <div class="print-item">
              <span class="print-label">Team Name</span>
              <div class="print-value">${teamInfo.teamName}</div>
            </div>
            ` : ''}
            
            <div class="print-item">
              <span class="print-label">Team Size</span>
              <div class="print-value">${teamInfo.memberCount}${teamInfo.maxMembers ? ` / ${teamInfo.maxMembers}` : ''} members</div>
            </div>
          </div>
          
          ${!teamInfo.isLeader && teamInfo.leader ? `
          <h3>Team Leader Information</h3>
          <div class="print-team-member print-team-leader">
            <div class="print-team-member-header">👑 ${teamInfo.leader.fullName || 'Team Leader'}</div>
            <div class="print-grid-3">
              <div class="print-item">
                <span class="print-label">Email</span>
                <div class="print-value">${teamInfo.leader.email || 'Not available'}</div>
              </div>
              <div class="print-item">
                <span class="print-label">Mobile</span>
                <div class="print-value">${teamInfo.leader.mobileNumber || 'Not available'}</div>
              </div>
              <div class="print-item">
                <span class="print-label">Institution</span>
                <div class="print-value">${teamInfo.leader.collegeName || 'Not available'}</div>
              </div>
            </div>
          </div>
          ` : ''}
          
          ${teamInfo.members && teamInfo.members.length > 0 ? `
          <!-- Team Members Table -->
          <h3>${teamInfo.isLeader ? 'Team Members' : 'All Team Members'}</h3>
          <table class="print-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Email</th>
                <th>Institution</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${teamInfo.members.map((member: any) => `
                <tr>
                  <td><strong>${member.participant?.fullName || 'Name not available'}</strong></td>
                  <td>${member.participant?.email || 'Email not available'}</td>
                  <td>${member.participant?.collegeName || 'Institution not available'}</td>
                  <td>${member.participant?.state ? `${member.participant.state}, ${member.participant.district}` : 'Location not available'}</td>
                  <td>${(member.participant?.status || 'REGISTERED').replace('_', ' ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ` : `
          <div style="text-align: center; padding: 20px; font-style: italic; background: #f9f9f9; border-radius: 5px;">
            ${teamInfo.role === 'Individual Participant' ? 
              'This participant is registered as an individual participant.' :
              'Team member information is being processed or not available.'
            }
          </div>
          `}
        </div>

        <!-- Contact Information Summary -->
        <div class="print-section">
          <h2>📞 Contact Information Summary</h2>
          <div class="print-contact-grid">
            <div class="print-contact-item">
              <strong>📧 Primary Email:</strong> ${participant.email || participant.user?.email || 'Not provided'}
            </div>
            <div class="print-contact-item">
              <strong>📱 Mobile Number:</strong> ${participant.mobileNumber || 'Not provided'}
            </div>
            <div class="print-contact-item">
              <strong>💬 WhatsApp:</strong> ${participant.whatsappNumber || 'Not provided'}
            </div>
            <div class="print-contact-item">
              <strong>🏫 Institution:</strong> ${participant.collegeName || 'Not provided'}
            </div>
          </div>
          
          <div class="print-item print-full-width" style="margin-top: 15px;">
            <span class="print-label">Complete Address</span>
            <div class="print-value">
              ${participant.collegeName || 'Institution not specified'}<br>
              ${participant.collegeAddress || 'Address not provided'}<br>
              ${participant.district || 'District not specified'}, ${participant.state || 'State not specified'}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="print-footer">
          <p><strong>INSPRANO 2025 - Government College of Engineering Kalahandi</strong></p>
          <p>Bhawanipatna, Kalahandi - 766003, Odisha, India</p>
          <p>Email: insprano.gcekbhawanipatna@gmail.com</p>
          <p>This is a computer-generated comprehensive participant report containing all available registration details.</p>
          <p><em>Report generated on ${currentDate} at ${currentTime} by Admin Dashboard</em></p>
        </div>
      </div>
    `;
  };

  return (
    <Button 
      onClick={handlePrint}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <PrinterIcon className="w-4 h-4" />
      Print Comprehensive Details
    </Button>
  );
}