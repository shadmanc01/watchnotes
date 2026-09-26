type MediaSearchFormProps = {
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function MediaSearchForm({
  value,
  isLoading,
  onChange,
  onSubmit,
}: MediaSearchFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="media-search">Search movies and TV shows</label>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          id="media-search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Try Interstellar or Breaking Bad"
          style={{ flex: 1, padding: 12 }}
        />
        <button type="submit" disabled={isLoading || value.trim().length < 2}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
}
