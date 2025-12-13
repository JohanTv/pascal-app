"use client";

import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { checkLeadStatusAction } from "@/actions/chat.actions";
import { ChatInterface } from "./chat-interface";
import { LeadCaptureForm } from "./lead-capture-form";

const LEAD_ID_KEY = "pascal_lead_id";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [showCaptureForm, setShowCaptureForm] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Smart Handshake: Check localStorage and verify with server
    const performHandshake = async () => {
      let storedLeadId = localStorage.getItem(LEAD_ID_KEY);

      if (!storedLeadId) {
        // Generate new UUID for first-time visitor
        storedLeadId = uuidv4();
        localStorage.setItem(LEAD_ID_KEY, storedLeadId);
        setLeadId(storedLeadId);
        setShowCaptureForm(true);
        setIsLoading(false);
        return;
      }

      // Verify with server
      const result = await checkLeadStatusAction(storedLeadId);

      if (result.success && result.value.exists) {
        // Returning user - skip form
        setLeadId(storedLeadId);
        setShowCaptureForm(false);
        setActiveConversationId(result.value.activeConversationId);
      } else {
        // ID exists locally but not in DB - show form
        setLeadId(storedLeadId);
        setShowCaptureForm(true);
      }

      setIsLoading(false);
    };

    performHandshake();
  }, []);

  const handleConversationStart = (
    conversationId: string,
    confirmedLeadId: string,
  ) => {
    // Update localStorage if server confirmed a different ID (email reconciliation)
    if (confirmedLeadId !== leadId) {
      localStorage.setItem(LEAD_ID_KEY, confirmedLeadId);
      setLeadId(confirmedLeadId);
    }

    setActiveConversationId(conversationId);
    setShowCaptureForm(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-yellow shadow-lg transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 ${
          isOpen ? "hidden lg:flex" : "flex"
        }`}
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-blue-dark" />
        ) : (
          <MessageCircle className="h-6 w-6 text-blue-dark" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex flex-col overflow-hidden bg-card lg:top-auto lg:left-auto lg:right-6 lg:bottom-24 lg:h-[600px] lg:w-full lg:max-w-md lg:rounded-xl lg:border lg:border-border lg:shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-blue to-blue-dark p-4">
            <div className="flex-1">
              <h3 className="font-semibold text-white">Chat con Pascal</h3>
              <p className="text-sm text-white/80">
                Estamos aquí para ayudarte
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 lg:hidden"
              aria-label="Cerrar chat"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : showCaptureForm && leadId ? (
              <LeadCaptureForm
                leadId={leadId}
                onSuccess={handleConversationStart}
              />
            ) : leadId ? (
              <ChatInterface
                conversationId={activeConversationId}
                leadId={leadId}
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
