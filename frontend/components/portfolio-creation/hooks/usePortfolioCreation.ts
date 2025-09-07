"use client";

import { useState, useCallback } from "react";
import { Portfolio } from "@/types";

interface UsePortfolioCreationProps {
  onCreatePortfolio: (portfolio: {
    name: string;
    description: string;
    assets: Array<{
      asset_id: string;
      symbol: string;
      name: string;
      quantity: number;
      average_price: number;
    }>;
  }) => void;
  onClose: () => void;
  existingPortfolios: Portfolio[];
}

export function usePortfolioCreation({
  onCreatePortfolio,
  onClose,
  existingPortfolios,
}: UsePortfolioCreationProps) {
  const [portfolioName, setPortfolioName] = useState("");
  const [portfolioDescription, setPortfolioDescription] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<
    Array<{
      asset_id: string;
      symbol: string;
      name: string;
      quantity: number;
      average_price: number;
    }>
  >([]);

  const canCreate =
    portfolioName.trim().length > 0 && selectedAssets.length > 0;

  const addAsset = useCallback(
    (asset: {
      asset_id: string;
      symbol: string;
      name: string;
      quantity: number;
      average_price: number;
    }) => {
      setSelectedAssets((prev) => {
        // Check if asset already exists
        const existingIndex = prev.findIndex(
          (a) => a.asset_id === asset.asset_id
        );
        if (existingIndex >= 0) {
          // Update existing asset
          const updated = [...prev];
          updated[existingIndex] = asset;
          return updated;
        } else {
          // Add new asset
          return [...prev, asset];
        }
      });
    },
    []
  );

  const removeAsset = useCallback((assetId: string) => {
    setSelectedAssets((prev) =>
      prev.filter((asset) => asset.asset_id !== assetId)
    );
  }, []);

  const updateAssetQuantity = useCallback(
    (assetId: string, quantity: number) => {
      setSelectedAssets((prev) =>
        prev.map((asset) =>
          asset.asset_id === assetId
            ? { ...asset, quantity: Math.max(0, quantity) }
            : asset
        )
      );
    },
    []
  );

  const updateAssetPrice = useCallback((assetId: string, price: number) => {
    setSelectedAssets((prev) =>
      prev.map((asset) =>
        asset.asset_id === assetId
          ? { ...asset, average_price: Math.max(0, price) }
          : asset
      )
    );
  }, []);

  const handleCreatePortfolio = useCallback(() => {
    if (!canCreate) return;

    // Validate that all selected assets have valid quantities and prices
    const invalidAssets = selectedAssets.filter(
      (asset) => asset.quantity <= 0 || asset.average_price <= 0
    );

    if (invalidAssets.length > 0) {
      alert("Please enter valid quantities and prices for all selected assets");
      return;
    }

    onCreatePortfolio({
      name: portfolioName.trim(),
      description: portfolioDescription.trim(),
      assets: selectedAssets,
    });
  }, [
    canCreate,
    portfolioName,
    portfolioDescription,
    selectedAssets,
    onCreatePortfolio,
  ]);

  const resetForm = useCallback(() => {
    setPortfolioName("");
    setPortfolioDescription("");
    setSelectedAssets([]);
  }, []);

  return {
    portfolioName,
    setPortfolioName,
    portfolioDescription,
    setPortfolioDescription,
    selectedAssets,
    setSelectedAssets,
    addAsset,
    removeAsset,
    updateAssetQuantity,
    updateAssetPrice,
    canCreate,
    handleCreatePortfolio,
    resetForm,
  };
}
