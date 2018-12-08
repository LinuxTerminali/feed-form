import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import classNames from 'classnames';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import config from './config.json';

const styles = (theme) => ({
	card: {
		maxWidth: 275
	},
	gridContainer: {
		margin: 0,
		width: 'auto'
	},
	container: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	textField: {
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit
	},
	button: {
		margin: 15
	},
	dense: {
		marginTop: 16
	},
	menu: {
		width: 200
	},
	error: {
		color: '#d32f2f'
	}
});

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			first: '',
			last: '',
			email: '',
			uploaded: false,
			downloadurl: '',
			error: '',
			errorSnack: false
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event) {
		this.setState({ [event.target.id]: event.target.value });
	}
	handleSubmit(event) {
		fetch(config['lambdaUrl'], {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state)
		})
			.then((res) => {
				return res.json();
			})
			.then((json) => {
				if (!json['upload']) {
					this.setState({ error: json['error'] });
					this.setState({ errorSnack: true });
					console.log(this.state);
				} else {
          this.setState({ errorSnack: false });
					this.setState({ uploaded: true });
					this.setState({ downloadurl: json['url'] });
				}
			});
		event.preventDefault();
	}
	handleDownload = (event, reason) => {
		if (this.state.downloadurl) {
			window.open(this.state.downloadurl, '_blank');
		}
		this.setState({ uploaded: false });
	};
	handleClose = (event, reason) => {
		console.log(event, reason);
		if (reason === 'clickaway') {
			return;
		}
		this.setState({ uploaded: false });
		this.setState({ errorSnack: false });
	};
	render() {
		const { classes } = this.props;
		const { first, last, email, uploaded, error, errorSnack } = this.state;

		const isEnabled = first.length > 0 && last.length > 0 && email.length > 0;
		return (
			<React.Fragment>
				<Grid container className={classes.gridContainer} justify="center" spacing={0}>
					<Card className={classes.card}>
						<form className={classes.container} noValidate autoComplete="off" onSubmit={this.handleSubmit}>
							<Grid container justify="center" spacing={0}>
								<h1>Feed Form!</h1>
								<TextField
									id="first"
									label="First Name"
									className={classes.textField}
									value={this.state.name}
									onChange={this.handleChange}
									margin="normal"
									variant="outlined"
								/>

								<TextField
									id="last"
									label="Last Name"
									value={this.state.lastname}
									onChange={this.handleChange}
									className={classes.textField}
									margin="normal"
									variant="outlined"
								/>

								<TextField
									id="email"
									label="Email"
									className={classes.textField}
									value={this.state.email}
									onChange={this.handleChange}
									type="email"
									name="email"
									autoComplete="email"
									margin="normal"
									variant="outlined"
								/>

								<Button
									disabled={!isEnabled}
									variant="contained"
									color="secondary"
									type="submit"
									className={classes.button}
								>
									<SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
									Save
								</Button>
							</Grid>
						</form>
					</Card>
					<Snackbar
						open={uploaded}
						ContentProps={{
							'aria-describedby': 'message-id'
						}}
						message={<span id="message-id">Saved Succefully Download</span>}
						action={[
							<Button key="undo" color="secondary" size="small" onClick={this.handleDownload}>
								Download
							</Button>,
							<IconButton
								key="close"
								aria-label="Close"
								color="inherit"
								className={classes.close}
								onClick={this.handleClose}
							>
								<CloseIcon />
							</IconButton>
						]}
					/>
					<Snackbar
						open={errorSnack}
						message={<span id="message-id">{error}</span>}
						action={[
							<IconButton
								key="close"
								aria-label="Close"
								color="inherit"
								className={classes.close}
								onClick={this.handleClose}
							>
								<CloseIcon />
							</IconButton>
						]}
					/>
				</Grid>
			</React.Fragment>
		);
	}
}

App.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);
