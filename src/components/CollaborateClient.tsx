"use client";
// Force rebuild to clear stale Turbopack errors

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, GitMerge, MessageSquarePlus, Plus, X, Lock, Unlock } from "lucide-react";
import { ProposalCard } from "@/components/ProposalCard";

type EditorMode = "replace" | "insert";

import { createProposal, adoptProposal, undoAdoptProposal, updatePostStatus, deleteProposal } from "@/app/actions";

interface CollaborateClientProps {
  postId: string;
  initialBaseText: string;
  initialPostStatus: "writing" | "completed";
  initialProposals: any[];
}

export default function CollaborateClient({
  postId,
  initialBaseText,
  initialPostStatus,
  initialProposals,
}: CollaborateClientProps) {
  const [proposals, setProposals] = useState(initialProposals);
  const [baseText, setBaseText] = useState(initialBaseText);
  const [postStatus, setPostStatusLocal] = useState<"writing" | "completed">(initialPostStatus);
  const [activeTab, setActiveTab] = useState<"base" | "proposals">("proposals");

  const setPostStatus = (status: "writing" | "completed") => {
    setPostStatusLocal(status);
    updatePostStatus(postId, status);
  };
  
  // Text Selection State (for replace)
  const [selection, setSelection] = useState<{ text: string; top: number; left: number } | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Editor State
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);
  const [activeDraftTarget, setActiveDraftTarget] = useState<string>("");
  const [draftText, setDraftText] = useState("");

  const handleAdopt = async (id: string) => {
    const proposal = proposals.find(p => p.id === id);
    if (!proposal) return;

    // Update proposal UI status
    setProposals((current) =>
      current.map((p) =>
        p.id === id ? { ...p, isAdopted: true } : p
      )
    );

    // Calculate new base text
    let newText = baseText;
    const addedDiff = proposal.diffs.find((d: any) => d.type === "added");
    const addedText = addedDiff ? addedDiff.text : "";
    
    if (proposal.proposalType === "replace") {
      newText = newText.replace(proposal.targetContext, addedText);
    } else if (proposal.proposalType === "insert") {
      newText = newText.replace(proposal.targetContext, proposal.targetContext + "\n\n" + addedText);
    }
    
    // Update local state first
    setBaseText(newText);
    // Fire server action outside of setState
    await adoptProposal(id, postId, newText);
  };

  const handleUndoAdopt = async (id: string) => {
    const proposal = proposals.find(p => p.id === id);
    if (!proposal) return;

    // Revert proposal UI status
    setProposals((current) =>
      current.map((p) =>
        p.id === id ? { ...p, isAdopted: false } : p
      )
    );

    // Calculate reverted base text
    let newText = baseText;
    const addedDiff = proposal.diffs.find((d: any) => d.type === "added");
    const addedText = addedDiff ? addedDiff.text : "";
    
    if (proposal.proposalType === "replace") {
      newText = newText.replace(addedText, proposal.targetContext);
    } else if (proposal.proposalType === "insert") {
      // Special purely string matching replacement for the simple mockup
      newText = newText.replace("\n\n" + addedText, "");
    }
    
    // Update local state first
    setBaseText(newText);
    // Fire server action outside of setState
    await undoAdoptProposal(id, postId, newText);
  };

  const handleDeleteProposal = async (id: string) => {
    // Optimistic update
    setProposals((current) => current.filter((p) => p.id !== id));
    
    // Server Action
    await deleteProposal(id, postId);
  };

  const handleMouseUp = () => {
    if (postStatus === "completed") return; // Disable text selection for proposal if completed
    
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      const text = sel.toString().trim();
      if (text.length > 0 && textRef.current && sel.containsNode(textRef.current, true)) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelection({
          text,
          top: rect.top - 48,
          left: rect.left + rect.width / 2,
        });
        return;
      }
    }
    setSelection(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selection && textRef.current && !textRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('.propose-tooltip')) {
          setSelection(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selection]);

  const startReplaceProposal = () => {
    if (selection) {
      setEditorMode("replace");
      setActiveDraftTarget(selection.text);
      setDraftText("");
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const startInsertProposal = (paragraphText: string) => {
    setEditorMode("insert");
    // Store the preceding paragraph as context target
    setActiveDraftTarget(paragraphText);
    setDraftText("");
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const closeEditor = () => {
    setEditorMode(null);
    setActiveDraftTarget("");
    setDraftText("");
  };

  const submitProposal = async () => {
    if (!editorMode || !draftText.trim()) return;

    const diffs: { type: "unchanged" | "removed" | "added"; text: string }[] = [];
    
    if (editorMode === "replace") {
      diffs.push({ type: "removed", text: activeDraftTarget });
      diffs.push({ type: "added", text: draftText });
    } else if (editorMode === "insert") {
      // For insert, we show the preceding text as unchanged context, and the new text as added.
      // E.g. "...前の文。" (unchanged) -> "新しい文" (added)
      const excerpt = activeDraftTarget.length > 30 
        ? "..." + activeDraftTarget.slice(-30) 
        : activeDraftTarget;
      diffs.push({ type: "unchanged", text: excerpt });
      diffs.push({ type: "added", text: draftText });
    }

    const tempId = `prop-${Date.now()}`;
    const newProposal = {
      id: tempId,
      author: "T. Nakasako",
      avatarLetter: "T",
      timestamp: "たった今",
      initialUpvotes: 1,
      isAdopted: false,
      proposalType: editorMode,
      targetContext: activeDraftTarget,
      diffs,
    };

    setProposals([newProposal, ...proposals]);
    closeEditor();
    
    // Server Action
    try {
      const savedProposal = await createProposal(postId, editorMode, activeDraftTarget, JSON.stringify(diffs));
      // Update the temporary ID with the real one from the DB
      setProposals((current) =>
        current.map((p) => (p.id === tempId ? { ...p, id: savedProposal.id } : p))
      );
    } catch (error) {
      console.error("Failed to sync proposal:", error);
      // Optional: remove the optimistic proposal or show an error
    }
  };

  return (
    <div className="h-screen bg-canvas flex flex-col overflow-hidden">
      {/* Navbar Minimal */}
      <nav className="border-b border-border/50 bg-surface/50 backdrop-blur-sm relative z-50 h-14 flex items-center px-4 shrink-0">
        <Link 
          href="/post-1" 
          className="flex items-center gap-2 text-sm font-sans font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          本文に戻る
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2 font-serif text-sm font-bold tracking-tight text-ink/80 flex items-center gap-2">
          <GitMerge className="w-4 h-4 text-accent" />
          距離を進める
        </div>
      </nav>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-border/40 bg-surface">
        <button
          onClick={() => setActiveTab("base")}
          className={`flex-1 py-3 text-xs font-sans font-bold tracking-wider uppercase transition-all ${
            activeTab === "base" 
              ? "text-accent border-b-2 border-accent bg-accent/5" 
              : "text-ink-muted hover:bg-slate-50"
          }`}
        >
          原文 (Base Text)
        </button>
        <button
          onClick={() => setActiveTab("proposals")}
          className={`flex-1 py-3 text-xs font-sans font-bold tracking-wider uppercase transition-all ${
            activeTab === "proposals" 
              ? "text-accent border-b-2 border-accent bg-accent/5" 
              : "text-ink-muted hover:bg-slate-50"
          }`}
        >
          提案一覧 ({proposals.length})
        </button>
      </div>

      {/* Split Layout */}
      <div className="flex-1 flex overflow-hidden lg:flex-row flex-col">
        
        {/* Left: Original Context */}
        <div className={`lg:w-1/2 border-r border-border/50 overflow-y-auto bg-canvas/30 p-8 lg:p-12 relative ${
          activeTab === "base" ? "block" : "hidden lg:block"
        }`}>
          <div className="max-w-xl mx-auto opacity-70 hover:opacity-100 transition-opacity duration-500">
            <h2 className="text-sm font-sans font-bold text-ink-muted mb-6 uppercase tracking-widest flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>Base Text</span>
                {postStatus === "writing" ? (
                  <button 
                    onClick={() => setPostStatus("completed")}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200/50 rounded-full text-[10px] font-bold tracking-tight hover:bg-green-100 transition-colors"
                    title="クリックして「完成」にする（発案者のみ）"
                  >
                    <Unlock className="w-3 h-3" />
                    執筆中
                  </button>
                ) : (
                  <button 
                    onClick={() => setPostStatus("writing")}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200/80 rounded-full text-[10px] font-bold tracking-tight hover:bg-slate-200 transition-colors"
                    title="クリックして「執筆中」に戻す（発案者のみ）"
                  >
                    <Lock className="w-3 h-3" />
                    完成
                  </button>
                )}
              </div>
              
              <span className="text-[10px] bg-ink/5 px-2 py-1 rounded font-normal normal-case text-ink-muted/80">
                {postStatus === "completed" ? "提案は締め切られました" : "選択して修正、または＋で追記"}
              </span>
            </h2>
            <div 
              ref={textRef}
              onMouseUp={handleMouseUp}
              className={`prose prose-lg font-serif text-ink leading-loose space-y-6 text-[1.05rem] ${postStatus === 'writing' ? 'selection:bg-accent/20 cursor-text group/base' : ''}`}
            >
              {baseText.split("\n\n").map((p, i) => (
                <div key={i} className="relative group/paragraph">
                  <p className="pr-12">{p}</p>
                  
                  {/* Floating Action Button for insertion */}
                  {postStatus === "writing" && (
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-0 group-hover/paragraph:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => startInsertProposal(p)}
                        className="w-8 h-8 rounded-full bg-surface border border-border/80 shadow-sm flex items-center justify-center text-ink-muted hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all"
                        title="この段落の後に文章を追加"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Tooltip for text replace */}
          {selection && (
            <div 
              className="propose-tooltip fixed z-50 animate-in fade-in zoom-in duration-200"
              style={{
                top: `${selection.top}px`,
                left: `${selection.left}px`,
                transform: 'translateX(-50%)'
              }}
            >
              <button
                onClick={startReplaceProposal}
                className="flex items-center gap-1.5 bg-ink text-surface rounded-md shadow-xl px-3 py-2 text-sm font-sans font-medium hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-0.5"
              >
                <MessageSquarePlus className="w-4 h-4" />
                この部分を修正
              </button>
              <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-ink rotate-45 -translate-x-1/2"></div>
            </div>
          )}
        </div>

        {/* Right: Proposals Stream OR Editor */}
        <div className={`lg:w-1/2 overflow-y-auto bg-canvas/60 p-4 lg:p-8 ${
          activeTab === "proposals" || editorMode ? "block" : "hidden lg:block"
        }`}>
          <div className="max-w-xl mx-auto py-4">
            
            {editorMode ? (
              /* NEW PROPOSAL EDITOR PANE */
              <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="font-sans font-bold text-2xl text-ink">
                    {editorMode === "replace" ? "提案（修正）を作成" : "提案（追記）を作成"}
                  </h1>
                  <button 
                    onClick={closeEditor}
                    className="p-2 text-ink-muted hover:text-ink hover:bg-slate-200/50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden mb-6">
                  <div className="px-5 py-4 border-b border-border/50 bg-slate-50/50">
                    <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
                      {editorMode === "replace" ? "対象テキスト" : "直前のテキスト（コンテキスト）"}
                    </h3>
                    
                    {editorMode === "replace" ? (
                      <div className="font-serif leading-loose text-lg text-diff-remove-text bg-diff-remove-bg px-4 py-3 rounded-lg opacity-80 line-through decoration-diff-remove-text/50">
                        {activeDraftTarget}
                      </div>
                    ) : (
                      <div className="font-serif leading-loose text-lg text-ink-muted bg-slate-100 px-4 py-3 rounded-lg opacity-70 relative">
                        ...{activeDraftTarget.slice(-60)}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3 flex justify-between items-center">
                      <span>あなたの提案</span>
                      <span className="text-diff-add-text font-serif lowercase tracking-normal bg-diff-add-bg px-2 py-0.5 rounded-sm">
                        + Diff
                      </span>
                    </h3>
                    <textarea
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      placeholder={editorMode === "replace" ? "新しい表現をここに入力..." : "続きの文章をここに入力..."}
                      className="w-full min-h-[160px] font-serif leading-loose text-lg resize-y outline-none border border-transparent focus:border-accent/30 focus:shadow-[0_0_0_4px_rgba(58,92,204,0.1)] rounded-lg p-4 bg-diff-add-bg/30 text-ink transition-all placeholder:text-ink-muted/30"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={closeEditor}
                    className="px-6 py-3 rounded-full font-sans font-medium text-ink-muted hover:bg-slate-200/50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button 
                    onClick={submitProposal}
                    disabled={draftText.trim().length === 0}
                    className="flex items-center gap-2 bg-ink text-surface px-8 py-3 rounded-full font-sans font-medium hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-ink transition-all shadow-sm"
                  >
                    <GitMerge className="w-4 h-4" />
                    提案を投げる
                  </button>
                </div>
              </div>
            ) : (
              /* PROPOSALS STREAM PANE */
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="font-sans font-bold text-2xl text-ink">提案された距離</h1>
                </div>

                <div className="space-y-6">
                  {proposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      {...proposal}
                      onAdopt={postStatus === "writing" ? handleAdopt : undefined}
                      onUndoAdopt={postStatus === "writing" ? handleUndoAdopt : undefined}
                      onDelete={handleDeleteProposal}
                    />
                  ))}
                  {proposals.length === 0 && (
                    <div className="text-center py-12 text-ink-muted font-sans text-sm">
                      まだ提案はありません。<br/>左のテキストを選択して、最初の距離を進めてみませんか。
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
