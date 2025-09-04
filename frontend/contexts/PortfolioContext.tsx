"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Portfolio, PortfolioHolding } from "@/types";

// State interface
interface PortfolioState {
  selectedPortfolioId: string | null;
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;
}

// Action types
type PortfolioAction =
  | { type: "SET_SELECTED_PORTFOLIO"; payload: string }
  | { type: "SET_PORTFOLIOS"; payload: Portfolio[] }
  | { type: "SET_CURRENT_PORTFOLIO"; payload: Portfolio }
  | { type: "ADD_PORTFOLIO"; payload: Portfolio }
  | { type: "UPDATE_PORTFOLIO"; payload: Portfolio }
  | { type: "DELETE_PORTFOLIO"; payload: string }
  | {
      type: "ADD_HOLDING";
      payload: { portfolioId: string; holding: PortfolioHolding };
    }
  | {
      type: "UPDATE_HOLDING";
      payload: { portfolioId: string; holding: PortfolioHolding };
    }
  | {
      type: "DELETE_HOLDING";
      payload: { portfolioId: string; holdingId: string };
    }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" };

// Initial state
const initialState: PortfolioState = {
  selectedPortfolioId: null,
  portfolios: [],
  currentPortfolio: null,
  isLoading: false,
  error: null,
};

// Reducer function
function portfolioReducer(
  state: PortfolioState,
  action: PortfolioAction
): PortfolioState {
  switch (action.type) {
    case "SET_SELECTED_PORTFOLIO":
      return {
        ...state,
        selectedPortfolioId: action.payload,
        currentPortfolio:
          state.portfolios.find((p) => p.id === action.payload) || null,
      };

    case "SET_PORTFOLIOS":
      return {
        ...state,
        portfolios: action.payload,
        currentPortfolio: state.selectedPortfolioId
          ? action.payload.find((p) => p.id === state.selectedPortfolioId) ||
            null
          : null,
      };

    case "SET_CURRENT_PORTFOLIO":
      return {
        ...state,
        currentPortfolio: action.payload,
        selectedPortfolioId: action.payload.id,
      };

    case "ADD_PORTFOLIO":
      return {
        ...state,
        portfolios: [...state.portfolios, action.payload],
      };

    case "UPDATE_PORTFOLIO":
      return {
        ...state,
        portfolios: state.portfolios.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
        currentPortfolio:
          state.currentPortfolio?.id === action.payload.id
            ? action.payload
            : state.currentPortfolio,
      };

    case "DELETE_PORTFOLIO":
      return {
        ...state,
        portfolios: state.portfolios.filter((p) => p.id !== action.payload),
        currentPortfolio:
          state.currentPortfolio?.id === action.payload
            ? null
            : state.currentPortfolio,
        selectedPortfolioId:
          state.selectedPortfolioId === action.payload
            ? null
            : state.selectedPortfolioId,
      };

    case "ADD_HOLDING":
      return {
        ...state,
        portfolios: state.portfolios.map((p) => {
          if (p.id === action.payload.portfolioId) {
            return {
              ...p,
              holdings: [...p.holdings, action.payload.holding],
            };
          }
          return p;
        }),
        currentPortfolio:
          state.currentPortfolio?.id === action.payload.portfolioId
            ? {
                ...state.currentPortfolio,
                holdings: [
                  ...state.currentPortfolio.holdings,
                  action.payload.holding,
                ],
              }
            : state.currentPortfolio,
      };

    case "UPDATE_HOLDING":
      return {
        ...state,
        portfolios: state.portfolios.map((p) => {
          if (p.id === action.payload.portfolioId) {
            return {
              ...p,
              holdings: p.holdings.map((h) =>
                h.id === action.payload.holding.id ? action.payload.holding : h
              ),
            };
          }
          return p;
        }),
        currentPortfolio:
          state.currentPortfolio?.id === action.payload.portfolioId
            ? {
                ...state.currentPortfolio,
                holdings: state.currentPortfolio.holdings.map((h) =>
                  h.id === action.payload.holding.id
                    ? action.payload.holding
                    : h
                ),
              }
            : state.currentPortfolio,
      };

    case "DELETE_HOLDING":
      return {
        ...state,
        portfolios: state.portfolios.map((p) => {
          if (p.id === action.payload.portfolioId) {
            return {
              ...p,
              holdings: p.holdings.filter(
                (h) => h.id !== action.payload.holdingId
              ),
            };
          }
          return p;
        }),
        currentPortfolio:
          state.currentPortfolio?.id === action.payload.portfolioId
            ? {
                ...state.currentPortfolio,
                holdings: state.currentPortfolio.holdings.filter(
                  (h) => h.id !== action.payload.holdingId
                ),
              }
            : state.currentPortfolio,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Context interface
interface PortfolioContextType {
  state: PortfolioState;
  dispatch: React.Dispatch<PortfolioAction>;
  selectPortfolio: (id: string) => void;
  addPortfolio: (portfolio: Portfolio) => void;
  updatePortfolio: (portfolio: Portfolio) => void;
  deletePortfolio: (id: string) => void;
  addHolding: (portfolioId: string, holding: PortfolioHolding) => void;
  updateHolding: (portfolioId: string, holding: PortfolioHolding) => void;
  deleteHolding: (portfolioId: string, holdingId: string) => void;
  clearError: () => void;
}

// Create context
const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
);

// Provider component
interface PortfolioProviderProps {
  children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);

  // Helper functions
  const selectPortfolio = (id: string) => {
    dispatch({ type: "SET_SELECTED_PORTFOLIO", payload: id });
  };

  const addPortfolio = (portfolio: Portfolio) => {
    dispatch({ type: "ADD_PORTFOLIO", payload: portfolio });
  };

  const updatePortfolio = (portfolio: Portfolio) => {
    dispatch({ type: "UPDATE_PORTFOLIO", payload: portfolio });
  };

  const deletePortfolio = (id: string) => {
    dispatch({ type: "DELETE_PORTFOLIO", payload: id });
  };

  const addHolding = (portfolioId: string, holding: PortfolioHolding) => {
    dispatch({ type: "ADD_HOLDING", payload: { portfolioId, holding } });
  };

  const updateHolding = (portfolioId: string, holding: PortfolioHolding) => {
    dispatch({ type: "UPDATE_HOLDING", payload: { portfolioId, holding } });
  };

  const deleteHolding = (portfolioId: string, holdingId: string) => {
    dispatch({ type: "DELETE_HOLDING", payload: { portfolioId, holdingId } });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value: PortfolioContextType = {
    state,
    dispatch,
    selectPortfolio,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    addHolding,
    updateHolding,
    deleteHolding,
    clearError,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

// Custom hook to use the context
export function usePortfolioContext() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error(
      "usePortfolioContext must be used within a PortfolioProvider"
    );
  }
  return context;
}

// Convenience hooks
export function useSelectedPortfolio() {
  const { state } = usePortfolioContext();
  return state.currentPortfolio;
}

export function usePortfolioList() {
  const { state } = usePortfolioContext();
  return state.portfolios;
}

export function usePortfolioLoading() {
  const { state } = usePortfolioContext();
  return state.isLoading;
}

export function usePortfolioError() {
  const { state } = usePortfolioContext();
  return state.error;
}
