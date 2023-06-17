export default function Error500Page({ error }) {
  return <p>500 internal error: {error.message}</p>;
}
