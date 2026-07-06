-- Registry CI validation. Run from repo root:
--   nvim --headless --clean -l scripts/validate.lua
-- Checks every splash is a pure-data module (loads in an EMPTY Lua env),
-- has a sane frames table, and that index.json <-> splashes/ match 1:1.
local fail = {}
local function bad(msg) table.insert(fail, msg) end

local files = {}
for _, f in ipairs(vim.fn.readdir("splashes")) do
  local name = f:match("^(.+)%.lua$")
  if not name then
    bad("non-lua file in splashes/: " .. f)
  elseif not name:match("^[%w_%-]+$") or name ~= name:lower() then
    bad("bad splash name (want lowercase [a-z0-9-_]): " .. name)
  else
    files[name] = true
    local content = table.concat(vim.fn.readfile("splashes/" .. f), "\n")
    -- empty env: pure data only — no globals, no require, no function calls
    local chunk, lerr = load(content, f, "t", {})
    if not chunk then
      bad(f .. " does not parse: " .. tostring(lerr))
    else
      local ok, data = pcall(chunk)
      if not ok then
        bad(f .. " not pure data (rejected in empty env): " .. tostring(data))
      elseif type(data) ~= "table" or type(data.frames) ~= "table" or #data.frames == 0 then
        bad(f .. " must return a table with a non-empty frames array")
      elseif type(data.frames[1]) ~= "table" or type(data.frames[1][1]) ~= "string" then
        bad(f .. " frames[n] must be an array of line strings")
      end
    end
  end
end

local ok_idx, idx = pcall(vim.json.decode,
  table.concat(vim.fn.readfile("index.json"), "\n"))
if not ok_idx or type(idx) ~= "table" then
  bad("index.json does not parse as a JSON array")
else
  local seen = {}
  for i, e in ipairs(idx) do
    if type(e) ~= "table" or type(e.name) ~= "string"
      or type(e.desc) ~= "string" or type(e.author) ~= "string" then
      bad("index entry " .. i .. " needs string fields: name, desc, author")
    elseif seen[e.name] then
      bad("duplicate index entry: " .. e.name)
    else
      seen[e.name] = true
      if not files[e.name] then bad("index lists missing file: " .. e.name) end
    end
  end
  for name in pairs(files) do
    if not seen[name] then bad("splash not in index.json: " .. name) end
  end
end

if #fail > 0 then
  for _, m in ipairs(fail) do print("FAIL: " .. m) end
  vim.cmd("cquit 1")
else
  print(("OK: %d splashes valid, index consistent"):format(vim.tbl_count(files)))
  vim.cmd("qa!")
end
