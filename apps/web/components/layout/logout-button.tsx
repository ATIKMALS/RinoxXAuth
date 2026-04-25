"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import { LogOut, Loader2, AlertTriangle } from "lucide-react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ignoreBackdropCloseRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showConfirm) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showConfirm]);

  const onLogout = async () => {
    setIsLoading(true);
    try {
      try {
        await fetch(`${window.location.origin}/api/auth/logout`, { method: "POST", credentials: "same-origin" });
      } catch {
        /* non-fatal */
      }
      await signOut({ redirect: false, callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
    window.location.href = "/login";
  };

  const openConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // Defer until the triggering click is fully finished (avoids overlay receiving the same click).
    window.setTimeout(() => {
      ignoreBackdropCloseRef.current = true;
      setShowConfirm(true);
      window.setTimeout(() => {
        ignoreBackdropCloseRef.current = false;
      }, 350);
    }, 10);
  };

  const closeConfirm = () => {
    if (!isLoading) setShowConfirm(false);
  };

  return (
    <>
      {/* Logout Button */}
      <button
        type="button"
        onClick={openConfirm}
        className="relative inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-300 transition-all duration-300 hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-200 hover:shadow-lg hover:shadow-rose-500/10 group overflow-hidden"
      >
        {/* Hover shine effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        <LogOut className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform duration-300" />
        <span className="relative z-10 hidden sm:inline">Logout</span>
      </button>

      {/* Modal rendered via portal so header/backdrop-filter cannot trap clicks or clip stacking */}
      {mounted &&
        showConfirm &&
        createPortal(
          <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <button
              type="button"
              aria-label="Close dialog"
              className="absolute inset-0 cursor-default border-0 bg-black/70 p-0 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => {
                if (ignoreBackdropCloseRef.current || isLoading) return;
                closeConfirm();
              }}
            />
            <div
              className="relative w-full max-w-sm bg-slate-900/95 border border-zinc-700/50 rounded-2xl shadow-2xl backdrop-blur-xl p-6 animate-in zoom-in-95 duration-300"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sign Out?</h3>
                <p className="text-sm text-zinc-400 mb-6">Are you sure you want to sign out of your account?</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeConfirm}
                    disabled={isLoading}
                    className="flex-1 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700/50 hover:border-zinc-600 transition-all duration-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    disabled={isLoading}
                    className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Signing out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn95 {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out;
        }
        .fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .zoom-in-95 {
          animation: zoomIn95 0.3s ease-out;
        }
      `}</style>
    </>
  );
}