// Stand-in for asset imports (`.scss`, images) under Jest, which cannot parse
// them. Mapped in `jest.config.js`; nothing imports this directly. Exports a
// string because image imports are used as `src` attributes.
export default 'asset-stub';
