import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useCampaigns(status?: "draft" | "scheduled" | "sending" | "completed" | "paused" | "failed", enabled: boolean = true) {
  const campaigns = useQuery(
    api.campaigns.listCampaigns, 
    enabled ? { 
      status,
      limit: 50 
    } : "skip"
  );
  
  return {
    campaigns: campaigns || [],
    isLoading: campaigns === undefined,
  };
}

export function useCampaignDetails(campaignId: Id<"campaigns">) {
  const campaign = useQuery(api.campaigns.getCampaign, { campaignId });
  const stats = useQuery(api.campaigns.getCampaignStats, { campaignId });
  
  return {
    campaign,
    stats,
    isLoading: campaign === undefined || stats === undefined,
  };
}

export function useRecipientLists() {
  const lists = useQuery(api.recipients.listRecipientLists, { limit: 50 });
  
  return {
    lists: lists || [],
    isLoading: lists === undefined,
  };
}

export function useDeliveryStats(campaignId?: Id<"campaigns">, enabled: boolean = true) {
  const stats = useQuery(
    api.deliveries.getDeliveryStats, 
    enabled ? { 
      campaignId 
    } : "skip"
  );
  
  return {
    stats,
    isLoading: stats === undefined,
  };
}