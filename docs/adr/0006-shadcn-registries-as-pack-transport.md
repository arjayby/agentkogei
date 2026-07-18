# shadcn registries as Design Pack transport

AgentKogei will use shadcn-compatible registries as the transport envelope for Design Packs rather than inventing a custom distribution protocol. Each pack will retain an AgentKogei-specific manifest, and the AgentKogei CLI will enforce licensing, safe file application, and Installed Pack metadata while using only registry data-fetching and validation capabilities. This provides public GitHub and authenticated private Pack Sources, cross-framework expansion potential, and ecosystem compatibility without surrendering the AgentKogei product model.
