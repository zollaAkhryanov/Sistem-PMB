import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Trash2, Home, HelpCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught applet error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetSession = () => {
    try {
      localStorage.removeItem('pmb_current_user');
      localStorage.removeItem('pmb_storage_users');
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans selection:bg-indigo-100">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 text-center relative overflow-hidden">
            {/* Ambient subtle color orb behind */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Huge 404 / Error Code Title */}
            <h1 className="text-8xl font-black font-display tracking-tighter text-slate-900 mb-2 animate-pulse select-none">
              404
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-6">
              <AlertCircle className="w-3.5 h-3.5" />
              Aplikasi Error / Halaman Tidak Ditemukan
            </div>

            {/* Error Message */}
            <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-2">
              Terjadi Kesalahan pada Sistem
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mb-6">
              Web atau aplikasi mendeteksi gangguan state eksternal (seperti masalah autentikasi, database, atau halaman yang tidak valid). Kami telah mengisolasi error ini demi keamanan data Anda.
            </p>

            {/* Technical Detail Collapsible (Just in case developers need to debug) */}
            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 mb-6 max-h-32 overflow-y-auto font-mono text-[10px] text-slate-500 scrollbar-thin">
              <span className="font-bold text-slate-700 block mb-1">Rincian Teknis:</span>
              <p className="break-all whitespace-pre-wrap">
                {this.state.error?.message || "Kesalahan Tidak Dikenal (Unknown Runtime Exception)"}
              </p>
              <p className="mt-1 text-slate-400">
                URL: {window.location.href}
              </p>
            </div>

            {/* Diagnostic self-healing actions */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 animate-spin-hover" />
                Segarkan Halaman (Reload Web)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={this.handleGoHome}
                  className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60 rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <Home className="w-3.5 h-3.5" />
                  Ke Beranda
                </button>
                <button
                  onClick={this.handleResetSession}
                  className="py-2.5 px-3 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200/60 hover:border-rose-100 rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                  title="Membersihkan semua cache sesi lokal yang rusak"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reset Sesi
                </button>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Butuh bantuan? Silakan hubungi admin di <span className="font-semibold text-slate-600">akhryanovzolla@gmail.com</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
