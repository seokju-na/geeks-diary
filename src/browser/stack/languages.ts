export enum CodeMirrorSupportedLanguageTypes {
    TYPESCRIPT = 'typescript',
    JAVASCRIPT = 'javascript',
    DART = 'dart',
    PYTHON = 'python',
    GO = 'go',
    JAVA = 'java',
    KOTLIN = 'kotlin',
    C = 'c',
    CPP = 'cpp',
    CSHARP = 'csharp',
    OBJECTIVE_C = 'objective-c',
    SCALA = 'scala',
    SQUIRREL = 'squirrel',
    CEYLON = 'ceylon',
    OCAML = 'ocaml',
    FSHARP = 'fsharp',
    OCTAVE = 'octave',
    PASCAL = 'pascal',
    CLOJURE = 'clojure',
    PHP = 'php',
    CMAKE = 'cmake',
    APL = 'apl',
    ASN1 = 'asn.1',
    OZ = 'oz',
    PERL = 'perl',
    POWERSHELL = 'powershell',
    PUG = 'pug',
    JADE = 'jade',
    D = 'd',
    R = 'r',
    DOCKERFILE = 'dockerfile',
    RUBY = 'ruby',
    RUST = 'rust',
    SASS = 'sass',
    SPREADSHEET = 'spreadsheet',
    DYLAN = 'dylan',
    ECL = 'ecl',
    ELM = 'elm',
    SHELL = 'shell',
    SMALLTALK = 'smalltalk',
    FORTRAN = 'fortran',
    STYLUS = 'stylus',
    SOY = 'soy',
    MYSQL = 'mysql',
    POSTGRESQL = 'pgsql',
    GROOVY = 'groovy',
    HAML = 'haml',
    SWIFT = 'swift',
    HANDLEBARS = 'handlebars',
    HASKELL = 'haskell',
    HTML = 'html',
    ASPX = 'aspx',
    EJS = 'ejs',
    JSP = 'jsp',
    HTTP = 'http',
    TOML = 'toml',
    TORNADO = 'tornado',
    LESS = 'less',
    VB_NET = 'vb',
    VBSCRIPT = 'vbscript',
    YAML = 'yaml',
    VUE = 'vue',
    NGINX = 'nginx',
    JINJA2 = 'jinja2',
    XML = 'xml',
}

const _ = CodeMirrorSupportedLanguageTypes;

/** Colors from https://github.com/doda/github-language-colors */
export const languageAndIconAndColorMap: {
    id: CodeMirrorSupportedLanguageTypes;
    icon?: string;
    color?: string;
}[] = [
    { id: _.TYPESCRIPT, icon: 'typescript', color: '#2b7489' },
    { id: _.JAVASCRIPT, icon: 'javascript', color: '#f1e05a' },
    { id: _.DART, color: '#00B4AB' },
    { id: _.PYTHON, icon: 'python', color: '#3572A5' },
    { id: _.GO, icon: 'go', color: '#375eab' },
    { id: _.JAVA, icon: 'java', color: '#b07219' },
    { id: _.KOTLIN, color: '#F18E33' },
    { id: _.C, icon: 'c', color: '#555555' },
    { id: _.CPP, icon: 'cplusplus', color: '#f34b7d' },
    { id: _.CSHARP, icon: 'csharp', color: '#178600' },
    { id: _.OBJECTIVE_C, color: '#438eff' },
    { id: _.SCALA, color: '#c22d40' },
    { id: _.SQUIRREL, color: '#800000' },
    { id: _.CEYLON, color: '#dfa535' },
    { id: _.OCAML, color: '#3be133' },
    { id: _.FSHARP, color: '#b845fc' },
    { id: _.OCTAVE },
    { id: _.PASCAL, color: '#E3F171' },
    { id: _.CLOJURE, icon: 'clojure', color: '#db5855' },
    { id: _.PHP, icon: 'php', color: '#4F5D95' },
    { id: _.CMAKE },
    { id: _.APL, color: '#5A8164' },
    { id: _.ASN1 },
    { id: _.OZ, color: '#fab738' },
    { id: _.PERL, color: '#0298c3' },
    { id: _.POWERSHELL, color: '#89e051' }, // Same color with 'shell'
    { id: _.PUG, color: '#e44b23' }, // Same color with 'html'
    { id: _.JADE, color: '#e44b23' }, // Same color with 'html'
    { id: _.D, color: '#ba595e' },
    { id: _.R, color: '#198CE7' },
    { id: _.DOCKERFILE, icon: 'docker', color: '#0db7ed' },
    { id: _.RUBY, icon: 'ruby', color: '#701516' },
    { id: _.RUST, color: '#dea584' },
    { id: _.SASS, icon: 'sass', color: '#563d7c' }, // Same color with 'css'
    { id: _.SPREADSHEET },
    { id: _.DYLAN, color: '#6c616e' },
    { id: _.ECL, color: '#8a1267' },
    { id: _.ELM, color: '#60B5CC' },
    { id: _.SHELL, color: '#89e051' },
    { id: _.SMALLTALK, color: '#596706' },
    { id: _.FORTRAN, color: '#4d41b1' },
    { id: _.STYLUS, color: '#563d7c' }, // Same color with 'css'
    { id: _.SOY, color: '#e44b23' }, // Same color with 'html'
    { id: _.MYSQL, icon: 'mysql' },
    { id: _.POSTGRESQL, icon: 'postgresql' },
    { id: _.GROOVY, color: '#e69f56' },
    { id: _.HAML },
    { id: _.SWIFT, icon: 'swift', color: '#ffac45' },
    { id: _.HANDLEBARS, color: '#e44b23' }, // Same color with 'html'
    { id: _.HASKELL, color: '#5e5086' },
    { id: _.HTML, icon: 'html5', color: '#e44b23' },
    { id: _.ASPX, icon: 'dot-net', color: '#6a40fd' },
    { id: _.EJS, color: '#e44b23' }, // Same color with 'html'
    { id: _.JSP, color: '#e44b23' }, // Same color with 'html'
    { id: _.HTTP },
    { id: _.TOML },
    { id: _.TORNADO, color: '#e44b23' }, // Same color with 'html'
    { id: _.LESS, icon: 'less',  color: '#563d7c' }, // Same color with 'css'
    { id: _.VB_NET, icon: 'visualstudio', color: '#945db7' },
    { id: _.VBSCRIPT, icon: 'visualstudio', color: '#945db7' },
    { id: _.YAML },
    { id: _.VUE, icon: 'vuejs', color: '#2c3e50' },
    { id: _.NGINX, icon: 'nginx' },
    { id: _.JINJA2, color: '#e44b23' }, // Same color with 'html'
    { id: _.XML, color: '#e44b23' }, // Same color with 'html'
];


/*
export const codeMirrorSupportedStackLanguages: {
    id: string;
    icon?: string;
    color?: string;
}[] = [
    // Based on codemirror
    { id: 'apl' },
    { id: 'typescript', icon: 'typescript', color: '#2b7489' },
    { id: 'javascript', icon: 'javascript', color: '#f1e05a' },
    { id: 'dart' },
    // { id: 'bat', icon: 'windows8', color: '#89e051' },
    { id: 'coffeescript', icon: 'coffeescript', color: '#244776' },
    { id: 'c', icon: 'c', color: '#555555' },
    { id: 'cpp', icon: 'cplusplus', color: '#f34b7d' },
    { id: 'csharp', icon: 'csharp', color: '#178600' },
    { id: 'css', icon: 'css3', color: '#563d7c' },
    { id: 'dockerfile', icon: 'docker' },
    { id: 'fsharp', color: '#b845fc' },
    { id: 'go', icon: 'go', color: '#375eab' },
    { id: 'handlebars', color: '#e44b23' }, // Same color with 'html'
    { id: 'html', icon: 'html5', color: '#e44b23' },
    { id: 'ini' },
    { id: 'java', icon: 'java', color: '#b07219' },
    { id: 'less', icon: 'less', color: '#563d7c' }, // Same color with 'css'
    { id: 'lua', color: '#000080' },
    { id: 'msdax' },
    // { id: 'mysql', icon: 'mysql' },
    { id: 'objective-c', color: '#438eff' },
    // { id: 'pgsql', icon: 'postgresql' },
    { id: 'php', icon: 'php', color: '#4F5D95' },
    { id: 'postiats', color: '#91de79' },
    // { id: 'powershell', color: '#89e051' }, // Same color with 'shell'
    { id: 'pug', color: '#e44b23' }, // Same color with 'html'
    { id: 'python', icon: 'python', color: '#3572A5' },
    { id: 'r', color: '#198ce7' },
    // { id: 'razor' },
    { id: 'redis', icon: 'redis' },
    // { id: 'redshift' },
    { id: 'ruby', icon: 'ruby', color: '#701516' },
    { id: 'rust', color: '#dea584' },
    // { id: 'sb', color: '#945db7' }, // Same color with 'Visual Basic'
    { id: 'shell' },
    { id: 'scss', icon: 'sass', color: '#563d7c' }, // Same color with 'css'
    // { id: 'sol' },
    { id: 'sql' },
    { id: 'swift', icon: 'swift', color: '#ffac45' },
    { id: 'vb', icon: 'visualstudio', color: '#945db7' },
    { id: 'vbscript', icon: 'visualstudio' },
    { id: 'xml', color: '#e44b23' }, // Same color with 'html'
    { id: 'yaml' },
];
*/
