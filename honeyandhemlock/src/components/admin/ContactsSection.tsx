import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, User, Calendar, MessageSquare, Trash2 } from 'lucide-react';

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: 'new' | 'read' | 'responded';
}

const ContactsSection = () => {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContacts = useCallback(async () => {
    try {
      // First, get contacts from localStorage
      const localData = localStorage.getItem('contacts');
      const localContacts = localData ? JSON.parse(localData) : [];

      // Try to fetch from Supabase
      let supabaseContacts = [];
      let dbError = null;

      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Map the data to match our interface
          supabaseContacts = (data || []).map(contact => ({
            id: contact.id,
            name: contact.name,
            email: contact.email,
            phone: contact.phone || '',
            subject: contact.subject || '',
            message: contact.message,
            date: contact.created_at,
            status: contact.status as 'new' | 'read' | 'responded'
          }));
        } else {
          dbError = error;
        }
      } catch (error) {
        dbError = error;
        console.log('Database fetch failed, using localStorage:', error);
      }

      // Merge contacts from both sources, removing duplicates
      const allContacts = [...supabaseContacts];
      const supabaseIds = new Set(supabaseContacts.map(c => c.id));

      // Add localStorage contacts that aren't in Supabase
      localContacts.forEach((localContact: any) => {
        if (!supabaseIds.has(localContact.id)) {
          allContacts.push({
            id: localContact.id,
            name: localContact.name,
            email: localContact.email,
            phone: localContact.phone || '',
            subject: localContact.subject || '',
            message: localContact.message,
            date: localContact.date || localContact.created_at,
            status: localContact.status as 'new' | 'read' | 'responded'
          });
        }
      });

      // Sort by date (newest first)
      allContacts.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setContacts(allContacts);

      if (dbError && allContacts.length === localContacts.length) {
        toast({
          title: "Notice",
          description: "Showing locally stored contacts. Database connection unavailable.",
        });
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);

      // Ultimate fallback
      const contactsData = localStorage.getItem('contacts');
      const parsedContacts = contactsData ? JSON.parse(contactsData) : [];
      setContacts(parsedContacts.sort((a: ContactSubmission, b: ContactSubmission) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));

      toast({
        title: "Warning",
        description: "Failed to load contacts properly. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const updateContactStatus = async (contactId: number | string, newStatus: 'new' | 'read' | 'responded') => {
    try {
      // Try to update in Supabase
      try {
        const { error } = await supabase
          .from('contacts')
          .update({ status: newStatus })
          .eq('id', contactId);

        if (error) {
          console.log('Database update failed, updating localStorage:', error);
        }
      } catch (dbError) {
        console.log('Database update failed:', dbError);
      }

      // Always update in localStorage
      const localData = localStorage.getItem('contacts');
      if (localData) {
        const localContacts = JSON.parse(localData);
        const updatedLocalContacts = localContacts.map((contact: any) =>
          contact.id === contactId ? { ...contact, status: newStatus } : contact
        );
        localStorage.setItem('contacts', JSON.stringify(updatedLocalContacts));
      }

      // Update local state
      const updatedContacts = contacts.map(contact =>
        contact.id === contactId ? { ...contact, status: newStatus } : contact
      );
      setContacts(updatedContacts);

      toast({
        title: "Success",
        description: "Contact status updated",
      });
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast({
        title: "Error",
        description: "Failed to update contact status",
        variant: "destructive"
      });
    }
  };

  const deleteContact = async (contactId: number | string) => {
    try {
      // Try to delete from Supabase
      try {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', contactId);

        if (error) {
          console.log('Database delete failed, removing from localStorage:', error);
        }
      } catch (dbError) {
        console.log('Database delete failed:', dbError);
      }

      // Always delete from localStorage
      const localData = localStorage.getItem('contacts');
      if (localData) {
        const localContacts = JSON.parse(localData);
        const updatedLocalContacts = localContacts.filter((contact: any) => contact.id !== contactId);
        localStorage.setItem('contacts', JSON.stringify(updatedLocalContacts));
      }

      // Update local state
      const updatedContacts = contacts.filter(contact => contact.id !== contactId);
      setContacts(updatedContacts);

      toast({
        title: "Success",
        description: "Contact submission deleted",
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact submission",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'read':
        return <Badge className="bg-yellow-100 text-yellow-800">Read</Badge>;
      case 'responded':
        return <Badge className="bg-green-100 text-green-800">Responded</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-portfolio-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-portfolio-gold mx-auto mb-4"></div>
          <p>Loading contact submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contacts Overview */}
      <Card className="bg-[#282828] border-none">
        <CardHeader>
          <CardTitle className="text-portfolio-white flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Contact Submissions Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-portfolio-white">{contacts.length}</div>
              <div className="text-gray-400">Total Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {contacts.filter(c => c.status === 'new').length}
              </div>
              <div className="text-gray-400">New</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {contacts.filter(c => c.status === 'read').length}
              </div>
              <div className="text-gray-400">Read</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {contacts.filter(c => c.status === 'responded').length}
              </div>
              <div className="text-gray-400">Responded</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card className="bg-[#282828] border-none">
        <CardHeader>
          <CardTitle className="text-portfolio-white">Contact Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Phone</TableHead>
                <TableHead className="text-gray-400">Subject</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-portfolio-white/60">
                      <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No contact submissions</p>
                      <p className="text-sm">Contact form submissions will appear here.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact.id} className={contact.status === 'new' ? 'bg-blue-50/5' : ''}>
                    <TableCell className="text-portfolio-white font-medium">{contact.name}</TableCell>
                    <TableCell className="text-portfolio-white">
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-portfolio-gold hover:underline flex items-center"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        {contact.email}
                      </a>
                    </TableCell>
                    <TableCell className="text-portfolio-white">
                      {contact.phone ? (
                        <a 
                          href={`tel:${contact.phone}`}
                          className="text-portfolio-gold hover:underline flex items-center"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          {contact.phone}
                        </a>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-portfolio-white max-w-xs truncate">{contact.subject}</TableCell>
                    <TableCell className="text-portfolio-white">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(contact.date)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(contact.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-[#FFD62F] text-black hover:bg-[#FFD62F]/90 border-none"
                          onClick={() => {
                            updateContactStatus(contact.id, contact.status === 'new' ? 'read' : 'responded');
                          }}
                        >
                          {contact.status === 'new' ? 'Mark Read' : 'Mark Responded'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                          onClick={() => deleteContact(contact.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Contact Details */}
      {contacts.length > 0 && (
        <Card className="bg-[#282828] border-none">
          <CardHeader>
            <CardTitle className="text-portfolio-white">Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contacts.slice(0, 3).map((contact) => (
                <div key={contact.id} className="p-4 bg-[#232323] rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-portfolio-gold" />
                      <span className="text-portfolio-white font-medium">{contact.name}</span>
                      {getStatusBadge(contact.status)}
                    </div>
                    <span className="text-gray-400 text-sm">{formatDate(contact.date)}</span>
                  </div>
                  <h4 className="text-portfolio-gold font-medium mb-2">{contact.subject}</h4>
                  <p className="text-portfolio-white/80 text-sm leading-relaxed">{contact.message}</p>
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {contact.phone}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactsSection;