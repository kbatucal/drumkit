/**
 * Beats save/load for logged-in users via Supabase.
 */
(function () {
  "use strict";

  let supabase = null;
  let recordStartTime = 0;
  let recordedHits = [];
  let isRecording = false;

  window.initBeats = function (user) {
    const toolbar = document.getElementById("beats-toolbar");
    if (!toolbar) return;
    if (user && user.id) {
      toolbar.classList.remove("hidden");
      if (window._supabaseClient) {
        supabase = window._supabaseClient;
      } else if (typeof window.supabase !== "undefined" && typeof SUPABASE_URL !== "undefined" && typeof SUPABASE_ANON_KEY !== "undefined") {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      }
      toolbar.innerHTML = `
        <div class="beats-controls">
          <button type="button" class="beats-btn" id="beats-record-btn" data-action="record">Record</button>
          <div id="beats-save-section" class="beats-save-section hidden">
            <input type="text" id="beats-save-name" placeholder="Beat name" maxlength="50" />
            <button type="button" class="beats-btn" id="beats-save-btn" disabled>Save</button>
          </div>
        </div>
        <div class="beats-section">
          <p class="beats-label">My beats</p>
          <div id="beats-list" class="beats-list"><p class="beats-loading">Loading...</p></div>
        </div>
      `;
      loadBeatsList(user.id);
      const recBtn = document.getElementById("beats-record-btn");
      const savBtn = document.getElementById("beats-save-btn");
      if (recBtn) recBtn.addEventListener("click", toggleRecord);
      if (savBtn) savBtn.addEventListener("click", () => saveBeat(user.id));
    } else {
      toolbar.classList.add("hidden");
      toolbar.innerHTML = "";
    }
  };

  function getBeatsListEl() {
    return document.getElementById("beats-list");
  }
  function getRecordBtn() {
    return document.getElementById("beats-record-btn");
  }
  function getSaveBtn() {
    return document.getElementById("beats-save-btn");
  }
  function getSaveNameInput() {
    return document.getElementById("beats-save-name");
  }

  window.recordPadHit = function (sound) {
    if (!isRecording) return;
    const offset = Math.round(performance.now() - recordStartTime);
    recordedHits.push({ sound, offset });
  };

  function startRecording() {
    isRecording = true;
    recordStartTime = performance.now();
    recordedHits = [];
    const btn = getRecordBtn();
    if (btn) {
      btn.textContent = "Stop";
      btn.classList.add("recording");
      btn.dataset.action = "stop";
    }
  }

  function stopRecording() {
    isRecording = false;
    const btn = getRecordBtn();
    if (btn) {
      btn.textContent = "Record";
      btn.classList.remove("recording");
      btn.dataset.action = "record";
    }
    const saveSection = document.getElementById("beats-save-section");
    if (saveSection) {
      saveSection.classList.toggle("hidden", recordedHits.length === 0);
    }
    const saveBtn = getSaveBtn();
    if (saveBtn) saveBtn.disabled = recordedHits.length === 0;
  }

  function toggleRecord() {
    if (isRecording) stopRecording();
    else startRecording();
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function loadBeatsList(userId) {
    const listEl = getBeatsListEl();
    if (!listEl || !supabase) return;
    listEl.innerHTML = '<p class="beats-loading">Loading...</p>';
    supabase
      .from("beats")
      .select("id, name, hits, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          listEl.innerHTML = '<p class="beats-error">Could not load beats</p>';
          console.warn("Supabase load error:", error);
          return;
        }
        if (!data || data.length === 0) {
          listEl.innerHTML = '<p class="beats-empty">No saved beats</p>';
          return;
        }
        listEl.innerHTML = "";
        data.forEach((row) => {
          const item = document.createElement("div");
          item.className = "beats-item";
          item.innerHTML = `
            <span class="beats-item-name">${escapeHtml(row.name || "Unnamed")}</span>
            <div class="beats-item-actions">
              <button type="button" class="beats-item-play" data-id="${row.id}" aria-label="Play">▶</button>
              <button type="button" class="beats-item-delete" data-id="${row.id}" aria-label="Delete">×</button>
            </div>
          `;
          listEl.appendChild(item);
        });
      });
  }

  function playBeat(hits) {
    if (!hits || hits.length === 0) return;
    if (typeof window.playSound !== "function") return;
    hits.forEach((h) => {
      setTimeout(() => {
        window.playSound(h.sound);
      }, h.offset);
    });
  }

  function saveBeat(userId) {
    const nameInput = getSaveNameInput();
    const name = (nameInput && nameInput.value.trim()) || "My Beat";
    if (!supabase || !userId) return;
    supabase
      .from("beats")
      .insert({ user_id: userId, name, hits: recordedHits })
      .then(({ error }) => {
        if (error) {
          console.warn("Save error:", error);
          const msg = error.message || "Unknown error";
          alert("Could not save beat: " + msg + "\n\nSee SUPABASE_SETUP.md to create the beats table and RLS policies.");
          return;
        }
        if (nameInput) nameInput.value = "";
        recordedHits = [];
        const saveSection = document.getElementById("beats-save-section");
        if (saveSection) saveSection.classList.add("hidden");
        loadBeatsList(userId);
        const saveBtn = getSaveBtn();
        if (saveBtn) saveBtn.disabled = true;
      });
  }

  function deleteBeat(userId, beatId) {
    if (!supabase || !userId) return;
    supabase
      .from("beats")
      .delete()
      .eq("id", beatId)
      .eq("user_id", userId)
      .then(({ error }) => {
        if (!error) loadBeatsList(userId);
        else console.warn("Delete error:", error);
      });
  }

  document.addEventListener("click", (e) => {
    const playBtn = e.target.closest(".beats-item-play");
    const delBtn = e.target.closest(".beats-item-delete");
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (!user) return;
      if (playBtn) {
        const id = playBtn.dataset.id;
        supabase
          .from("beats")
          .select("hits")
          .eq("id", id)
          .eq("user_id", user.id)
          .single()
          .then(({ data }) => {
            if (data && data.hits) playBeat(data.hits);
          });
      }
      if (delBtn) {
        if (confirm("Delete this beat?")) deleteBeat(user.id, delBtn.dataset.id);
      }
    });
  });
})();
